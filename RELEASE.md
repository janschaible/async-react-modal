# Release guide

Choose the appropriate semantic-version change:

```sh
npm version patch # 0.1.0 -> 0.1.1
npm version minor # 0.1.0 -> 0.2.0
npm version major # 0.1.0 -> 1.0.0
```

Then publish and push the generated commit and tag:

```sh
npm publish
git push --follow-tags
```

Published npm versions cannot be overwritten. If a release needs a correction,
increment the version and publish again.
