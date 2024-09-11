# vue3-ciallo-viewer

**An exquisite vue3 image preview component.**

## Install

```bash
npm install vue3-ciallo-viewer --save
```

## Props

| Prop| Type| Default|Description|
| --- | --- | --- |---|
|open|Boolean|false|Controls whether the image viewer is visible|
|images|Array|[]|Array of image URLs to display|
|duration|Number|300|Transition duration in milliseconds.|
|targetIndex|Number|0|Index of the currently displayed image.|

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
