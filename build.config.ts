import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/cli'],
  rollup: {
    emitCJS: false,
  },
})
