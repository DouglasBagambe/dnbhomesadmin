import test from 'node:test';import assert from 'node:assert/strict';import {mediaBatches} from '../lib/media-batches.mjs';
const MB=1024*1024;
test('25 selected files retain order in safe batches',()=>{const files=Array.from({length:25},(_,i)=>({name:String(i),type:i<20?'image/jpeg':'video/mp4',size:MB}));const batches=mediaBatches(files);assert.deepEqual(batches.map(b=>b.length),[10,10,5]);assert.deepEqual(batches.flat(),files)});
test('video-heavy selections also respect aggregate bytes',()=>{assert.deepEqual(mediaBatches(Array.from({length:5},()=>({name:'video',type:'video/mp4',size:50*MB}))).map(b=>b.length),[2,2,1]);});
test('invalid formats, file sizes and total capacity are refused before uploading',()=>{for(const [files,count] of [[[ {name:'x',type:'image/svg+xml',size:1}],0],[[{name:'x',type:'image/jpeg',size:11*MB}],0],[[{name:'x',type:'video/mp4',size:51*MB}],0],[Array(25).fill({name:'x',type:'image/jpeg',size:1}),16]])assert.throws(()=>mediaBatches(files,count));});
