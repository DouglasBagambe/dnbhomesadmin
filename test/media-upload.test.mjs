import test from "node:test";
import assert from "node:assert/strict";
import { mediaUploadUrl } from "../lib/upload-url.mjs";
import { uploadMediaBatch, MediaUploadError } from "../lib/media-upload.mjs";
const files = [
  new File([new Uint8Array([255, 216, 255, 217])], "qa.jpg", {
    type: "image/jpeg",
  }),
];
const ticket = async () => ({
  token: "test-only-grant",
  uploadUrl: "https://upload.example.test/api/v1/media/uploads",
});
test("upload URL contains one API root and preserves the configured current host", () => {
  for (const suffix of ["", "/", "///"])
    assert.equal(
      mediaUploadUrl(
        "https://dnbhomesbackend-r8jx.onrender.com/api/v1" + suffix,
      ),
      "https://dnbhomesbackend-r8jx.onrender.com/api/v1/media/uploads",
    );
  for (const url of [
    "https://admin.example.test",
    "https://api.example.test/api/v1/api/v1",
    "https://user:secret@api.example.test/api/v1",
  ])
    assert.throws(() => mediaUploadUrl(url));
});
test("ticket failure remains safe and useful", async () => {
  const error = new Error("Upload authorization expired. Please retry.");
  error.safeMessage = true;
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket: async () => {
        throw error;
      },
    }),
    /authorization expired/,
  );
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket: async () => {
        throw Error("private key");
      },
    }),
    (e) => !e.message.includes("private key") && e.safeMessage,
  );
});
test("direct uploads carry the grant, no cookies, and surface known safe storage errors", async () => {
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket: ticket,
      fetcher: async (url, options) => {
        assert.equal(options.credentials, "omit");
        assert.equal(
          options.headers["X-Media-Upload-Token"],
          "test-only-grant",
        );
        assert.ok(options.signal);
        return Response.json(
          {
            error: {
              code: "STORAGE_UNAVAILABLE",
              message: "Media storage is temporarily unavailable.",
            },
          },
          { status: 503 },
        );
      },
    }),
    /storage is temporarily unavailable/,
  );
});
test("network failures and invalid responses have retry guidance without internals", async () => {
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket: ticket,
      fetcher: async () => {
        throw Error("secret endpoint");
      },
    }),
    /network or DNS/,
  );
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket: ticket,
      fetcher: async () =>
        Response.json(
          { error: { message: "private exception" } },
          { status: 500 },
        ),
    }),
    (e) =>
      e instanceof MediaUploadError && !e.message.includes("private exception"),
  );
});
test("a later failed batch cannot remove earlier successes and a fresh grant is obtained on retry", async () => {
  let grants = 0;
  const issueTicket = async () => {
    grants++;
    return ticket();
  };
  const kept = await uploadMediaBatch(files, {
    issueTicket,
    fetcher: async () =>
      Response.json(
        {
          data: [{ url: "https://media.example.test/kept.jpg", type: "image" }],
        },
        { status: 201 },
      ),
  });
  await assert.rejects(
    uploadMediaBatch(files, {
      issueTicket,
      fetcher: async () => Response.json({}, { status: 503 }),
    }),
  );
  assert.equal(kept[0].url, "https://media.example.test/kept.jpg");
  const retried = await uploadMediaBatch(files, {
    issueTicket,
    fetcher: async () =>
      Response.json(
        {
          data: [
            { url: "https://media.example.test/retried.jpg", type: "image" },
          ],
        },
        { status: 201 },
      ),
  });
  assert.equal(grants, 3);
  assert.equal([...kept, ...retried].length, 2);
});
