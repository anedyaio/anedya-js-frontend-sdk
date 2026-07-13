# Contributing to Anedya JS Frontend SDK

Thank you for contributing to the Anedya JS Frontend SDK! To maintain a stable and robust library, we use a structured branching model, automated versioning with Changesets, and npm Trusted Publishing (OIDC) through GitHub Actions.

This document outlines the branching system, CI/CD pipeline, and the step-by-step process for making contributions and releasing new versions.

---

## 📌 Branching Architecture

We use three primary branches to manage the SDK lifecycle. Direct pushing to **all three primary branches (`develop`, `prerelease`, and `main`) is restricted**, please create PR for the same.

```
                  ┌────────────────────────────────────────┐
                  │          develop (Active Dev)          │
                  │   Stable Mode (No pre.json)            │
                  └───────────────────┬────────────────────┘
                                      │
                         Merge PR     │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         prerelease (Testing)           │
                  │   Pre Mode (beta tags)                 │
                  └───────────────────┬────────────────────┘
                                      │
                         Merge PR     │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             main (Release)             │
                  │   Exits Pre Mode (Stable tags)         │
                  └───────────────────┬────────────────────┘
                                      │
                                      │  Auto-Sync (CI/CD)
                                      ▼
```

### 1. `develop` (Active Development)
* **Purpose**: This is the integration branch for new features and bug fixes.
* **Mode**: Stable (it must **never** have a `.changeset/pre.json` file).
* **Permissions**: Protected branch. Updated only by merging feature/bugfix branches via Pull Request (direct pushes are restricted).

### 2. `prerelease` (Beta Testing)
* **Purpose**: Used for staging release candidates and publishing beta builds to npm under the `beta` tag (e.g. `0.1.2-beta.0`).
* **Mode**: Prerelease mode (configured with `.changeset/pre.json`).
* **Permissions**: Protected branch. Updated only by merging `develop` via Pull Request (direct pushes are restricted).

### 3. `main` (Stable Releases)
* **Purpose**: Production-ready branch representing the latest stable release published on npm under the `latest` tag (e.g. `0.1.2`).
* **Mode**: Stable.
* **Permissions**: Protected branch. Updated only by merging `prerelease` via Pull Request (direct pushes are restricted).

---

## 🦋 Versioning with Changesets

We use [Changesets](https://github.com/changesets/changesets) to handle semantic versioning (SemVer) and changelogs. 

### Why Changesets?
Instead of manually editing `package.json` or writing release logs, developer intent is captured using **changeset files** (small markdown files stored in the `.changeset/` folder).

When a changeset is added:
* **Patch bump**: For bug fixes or internal chores.
* **Minor bump**: For new, backwards-compatible features.
* **Major bump**: For breaking API changes.

---

## 🛠️ Contribution Workflow (For Developers)

To contribute a change, follow these steps:

### Step 1: Create a Feature Branch
Always branch off the latest `develop` branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Step 2: Add a Changeset
Once you've made your code changes, run the changeset command:
```bash
npx changeset
```
This CLI tool will ask you:
1. Which package(s) you want to bump (select `@anedyasystems/anedya-frontend-sdk`).
2. The bump type (major, minor, or patch).
3. A summary of the changes (this summary will become the entry in `CHANGELOG.md`).

Commit the generated `.changeset/*.md` file along with your code.

### Step 3: Submit a Pull Request
Open a Pull Request from `feature/your-feature-name` ➡️ **`develop`**.
* Once the PR is approved and the CI status check passes, merge it into `develop`.

---

## 🚀 Release Lifecycle (For Maintainers/Release Managers)

### Part 1: Publishing a Beta Build
When you are ready to publish a beta build (e.g. `v0.1.2-beta.0`) for testing:

1. **Merge `develop` into `prerelease`** via a Pull Request.
2. If `prerelease` is not yet in prerelease mode, run:
   ```bash
   npx changeset pre enter beta
   git add .changeset/pre.json
   git commit -m "chore(release): enter prerelease mode"
   ```
3. Push/Merge the changes to `prerelease`.
4. The **Publish Workflow** will run on GitHub:
   * It will version the packages (e.g. `0.1.2-beta.0`).
   * Build the SDK distribution.
   * Publish it to npm with the `beta` tag.
   * Commit the version bump and push it back to `prerelease` automatically.

---

### Part 2: Publishing a Stable Release
When the beta builds are fully verified and you are ready to publish a stable release (e.g. `v0.1.2`):

1. **Open a Pull Request** from `prerelease` ➡️ **`main`**.
2. **Merge the PR** into `main`.
3. The **Publish Workflow** on `main` will trigger automatically:
   * **Exit Prerelease Mode**: The CI will detect `.changeset/pre.json` and exit pre mode.
   * **Version**: It runs `npx changeset version` to bump to a stable version (e.g., `0.1.2`) and update the `CHANGELOG.md`.
   * **Publish**: Builds the SDK and publishes it to npm under the `latest` tag.
   * **Tagging & Release**: Creates a Git tag (e.g. `v0.1.2`), pushes it, and generates a GitHub Release with changelog notes.

---

### Part 3: Automated Post-Release Sync (Crucial)
After a stable version is published to npm, the `develop` branch must be updated with the latest version number and cleaned changelogs. 

To automate this, the publish workflow runs a post-release step:
* It attempts to merge `main` back into `develop` directly.
* **If `develop` is a protected branch**: The workflow will automatically create a Pull Request titled `chore(release): sync main vX.Y.Z to develop`. 
* **Action Required**: A maintainer must merge this automated PR immediately so that future developments start from the correct stable version.

---

## 🔒 Security & Trusted Publishing
Our npm publishing is secured using **Trusted Publishing (OIDC)**. 
