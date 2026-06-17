# @pictwo/faker

[![@pictwo/core](https://img.shields.io/npm/dt/@pictwo/core.svg?label=@pictwo/core)](https://www.npmjs.com/package/@pictwo/core)
[![@pictwo/faker](https://img.shields.io/npm/dt/@pictwo/faker.svg?label=@pictwo/faker)](https://www.npmjs.com/package/@pictwo/faker)
[![@pictwo/images](https://img.shields.io/npm/dt/@pictwo/images.svg?label=@pictwo/images)](https://www.npmjs.com/package/@pictwo/images)
[![Release](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/release.yml)
[![Run Tests](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml/badge.svg)](https://github.com/arkstack-hq/pictwo/actions/workflows/tests.yml)

A [Faker.js](https://fakerjs.dev) `image` module backed by **Pictwo**. Drop it onto
`faker` to make every generated image URL resolve to the hosted ArkStack image API
(or any provider supported by [`@pictwo/core`](../pictwo-core)).

```bash
pnpm add @pictwo/faker @faker-js/faker
```

## Usage

```ts
import { faker } from '@faker-js/faker';
import { pictwoImage } from '@pictwo/faker';

export const fake = {
  ...faker,
  image: pictwoImage(),
};

fake.image.url(); // https://pictwo.toneflix.net/640/480
fake.image.avatar(); // https://pictwo.toneflix.net/category/avatar/128/128
fake.image.fashion(); // https://pictwo.toneflix.net/category/fashion/640/480
```

The default provider is the hosted API at `https://pictwo.toneflix.net`.
`pictwoImage` is an alias of `createFakerImage`.

## Methods

| Method              | Route                                     |
| ------------------- | ----------------------------------------- |
| `url()`             | `/{width}/{height}`                       |
| `avatar()`          | `/category/avatar/{width}/{height}`       |
| `fashion()`         | `/category/fashion/{width}/{height}`      |
| `fabric()`          | `/category/fabric/{width}/{height}`       |
| `product()`         | `/category/product/{width}/{height}`      |
| `design()`          | `/category/design/{width}/{height}`       |
| `urlPicsumPhotos()` | `/{width}/{height}`                       |
| `urlLoremFlickr()`  | `/images/{category}?w={width}&h={height}` |

`urlPicsumPhotos()` also understands Faker's `grayscale` and `blur` options:

```ts
fake.image.urlPicsumPhotos({
  width: 100,
  height: 100,
  grayscale: true,
  blur: 4,
});
// https://pictwo.toneflix.net/100/100?filters=greyscale,blur:4
```

Any Faker image method that Pictwo does not implement (e.g. `dataUri`) throws a clear
`Not implemented` error.

## Configuration

`createFakerImage(config?)` accepts the full [`@pictwo/core`](../pictwo-core)
`PictwoConfig`, plus default `width`/`height`:

```ts
pictwoImage({
  width: 1000,
  height: 800,
  source: { driver: 'hosted', baseUrl: 'https://img.example.com' },
});
```
