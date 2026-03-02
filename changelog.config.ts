export default {
  types: {
    feat: { title: "Added", semver: "minor" },
    fix: { title: "Fixed", semver: "patch" },
    perf: { title: "Changed" },
    refactor: { title: "Changed" },
    docs: { title: "Changed" },
    chore: { title: "Changed" },
    test: { title: "Changed" },
    build: { title: "Changed" },
    ci: { title: "Changed" },
  },
  templates: {
    commitMessage: "chore: release v{{newVersion}}",
  },
};
