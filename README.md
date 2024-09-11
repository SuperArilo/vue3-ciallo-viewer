# vue3-ciallo-viewer

[![NPM version][npm-image]][npm-url] [![node version][node-image]][node-url] [![npm download][download-image]][download-url] [![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/vue3-ciallo-viewer.svg?style=flat-square
[npm-url]: https://npmjs.org/package/vue3-ciallo-viewer
[travis-image]: https://img.shields.io/travis/vue3-ciallo-viewer.svg?style=flat-square
[travis-url]: https://travis-ci.org/vue3-ciallo-viewer
[coveralls-image]: https://img.shields.io/coveralls/vue3-ciallo-viewer.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/vue3-ciallo-viewer?branch=master
[david-image]: https://img.shields.io/david/vue3-ciallo-viewer.svg?style=flat-square
[david-url]: https://david-dm.org/vue3-ciallo-viewer
[node-image]: https://img.shields.io/badge/node.js-%3E=_19-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/vue3-ciallo-viewer.svg?style=flat-square
[download-url]: https://npmjs.org/package/vue3-ciallo-viewer
[license-image]: https://img.shields.io/npm/l/vue3-ciallo-viewer.svg

**An exquisite vue3 image preview component.**

**Mobile device support** ✔

  

## Install

  

```bash

npm  install  vue3-ciallo-viewer  --save

```

  

## Props

  

| Prop| Type| Default|Description|

| --- | --- | --- |---|

|open|Boolean|false|Controls whether the image viewer is visible|

|images|Array|[]|Array of image URLs to display|

|duration|Number|300|Transition duration in milliseconds.|

|targetIndex|Number|0|Index of the currently displayed image.|

  

## Events

  

| Name| Description|

| --- | --- |

|open|Executed when the viewer is activated|

|close|Executed when the viewer is closed|

|prev|Triggered when navigating to the previous image|

|next|Triggered when navigating to the next image|

  
  
  

## Basic usage

  

```

<template>

<div>

<ImageView :open="status" :images="['images/1.png']" @close="() => status = false" />

<button @click="status =! status">点击</button>

</div>

</template>

<script setup lang="ts">

import { ImageView } from "vue3-ciallo-viewer"

import 'vue3-ciallo-viewer/dist/style.css'

import { ref } from 'vue'

const status = ref<boolean>(false)

</script>

  

```