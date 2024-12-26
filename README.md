# vue3-ciallo-viewer

[![NPM version][npm-image]][npm-url] [![node version][node-image]][node-url] [![npm download][download-image]][download-url] [![npm license][license-image]][download-url]

**An exquisite vue3 image preview component.**
**Mobile devices support zooming in and out ✔**

![effect1](https://github.com/SuperArilo/vue3-ciallo-viewer/blob/main/gif/2.gif?raw=true)
![effect1](https://github.com/SuperArilo/vue3-ciallo-viewer/blob/main/gif/1.gif?raw=true)

## Install

```bash
npm install vue3-ciallo-viewer --save
```

## API

### CialloViewer

#### Parameter List (Deprecated):
```
CialloViewer(
    array: HTMLCollection,
    targetIndex?: number | null,
    duration: number,
    zoomSpeed: number,
    maxScaleFactor: number)
```
#### Configuration Object:
```
CialloViewer({
    array: HTMLCollection,
    targetIndex: number | null,
    duration: number,
    zoomSpeed: number,
    maxScaleFactor: number
})
```
##### Parameters

* **array** : `HTMLCollection`
  The collection of images to display.
* **targetIndex** : `number | null` (optional)
  The index of the image to highlight, defaults to `0`.
* **duration** : `number` (optional)
  The duration of the image transition, in milliseconds. Defaults to `400`.
* **zoomSpeed** : `number` (optional)
  Controls the speed of zoom interactions. Defaults to `0.2` if not specified.
* **maxScaleFactor** : `number` (optional)
  Sets the maximum scale factor for zooming. Defaults to `5`

## API Basic usage

```
<template>
    <div>
        <div ref="images">
            <img class="image_class" v-for="(item, index) in list" :key="item.id" @click="handleClick(index)" :src="item.src"  alt=""/>
        </div>
    </div>
</template>
<script setup lang="ts">
import {CialloViewer} from "vue3-ciallo-viewer"
import 'vue3-ciallo-viewer/dist/style.css'
import {ref} from 'vue'
const list = ref<any[]>([
    {
        id: 0,
        src: './src/assets/images/1.jpg'
    },
    {
        id: 1,
        src: './src/assets/images/2.jpg'
    },
    {
        id: 2,
        src: './src/assets/images/3.jpg'
    }
])
const images = ref<HTMLElement>()
const handleClick = (index: number): void => {
    if(!images.value) return
    // Deprecated
    CialloViewer(images.value.getElementsByTagName('img'), index, 400, 0.2, 5)
    // or
    CialloViewer({
        array: images.value.getElementsByTagName('img'),
        targetIndex: index,
        duration: 400,
        zoomSpeed: 0.2,
        maxScaleFactor: 10
    })
}
</script>
```

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
[download-image]: https://img.shields.io/npm/d18m/vue3-ciallo-viewer
[download-url]: https://npmjs.org/package/vue3-ciallo-viewer
[license-image]: https://img.shields.io/npm/l/vue3-ciallo-viewer.svg
