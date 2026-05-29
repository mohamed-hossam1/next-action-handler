#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const REQUIRED_PACKAGES = [
  "better-auth",
  "next-safe-action",
  "pino",
  "pino-pretty",
  "server-only",
  "zod",
];

const USAGE = "Usage: npx next-action-handler@latest add";

function main() {
  const command = process.argv[2];

  if (command !== "add") {
    console.error(USAGE);
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const sourceRoot = path.resolve(__dirname, "..", "src");

  console.log("next-action-handler installer");

  if (!fs.existsSync(sourceRoot)) {
    fail("Could not find the bundled src/ directory.");
  }

  const installRoot = resolveInstallRoot(projectRoot);
  console.log("Installing to " + path.relative(projectRoot, installRoot));

  copySourceFiles(sourceRoot, installRoot);
  installMissingDependencies(projectRoot);

  console.log("");
  console.log("Success! next-action-handler installed at " + path.relative(projectRoot, installRoot));
}

function resolveInstallRoot(projectRoot) {
  const rootLib = path.join(projectRoot, "lib");
  const appLib = path.join(projectRoot, "app", "lib");

  if (isDirectory(rootLib)) {
    return path.join(rootLib, "next-action-handler");
  }

  if (isDirectory(appLib)) {
    return path.join(appLib, "next-action-handler");
  }

  return path.join(rootLib, "next-action-handler");
}

function copySourceFiles(sourceRoot, installRoot) {
  const files = collectFiles(sourceRoot);

  fs.mkdirSync(installRoot, { recursive: true });

  for (const sourceFile of files) {
    const relativePath = path.relative(sourceRoot, sourceFile);
    const targetFile = path.join(installRoot, relativePath);

    if (fs.existsSync(targetFile) && !shouldOverwrite(relativePath)) {
      console.log("Skipped " + relativePath);
      continue;
    }

    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.copyFileSync(sourceFile, targetFile);
    console.log("✅ " + relativePath);
  }
}

function collectFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push.apply(files, collectFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function shouldOverwrite(relativePath) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return false;
  }

  while (true) {
    const answer = prompt(relativePath + " already exists. Overwrite or skip? [o/s] ");
    const normalized = answer.trim().toLowerCase();

    if (
      normalized === "o" ||
      normalized === "overwrite" ||
      normalized === "y" ||
      normalized === "yes"
    ) {
      return true;
    }

    if (
      normalized === "" ||
      normalized === "s" ||
      normalized === "skip" ||
      normalized === "n" ||
      normalized === "no"
    ) {
      return false;
    }

    console.log("Please type overwrite or skip.");
  }
}

function prompt(question) {
  const buffer = Buffer.alloc(1024);

  fs.writeSync(1, question);

  try {
    const bytesRead = fs.readSync(0, buffer, 0, buffer.length, null);
    return buffer.toString("utf8", 0, bytesRead);
  } catch (error) {
    return "";
  }
}

function installMissingDependencies(projectRoot) {
  const packageJsonPath = path.join(projectRoot, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    fail("Could not find package.json in " + projectRoot + ". Run this command from your project root.");
  }

  const packageJson = readPackageJson(packageJsonPath);
  const missingPackages = REQUIRED_PACKAGES.filter(function (packageName) {
    return !hasPackage(packageJson, packageName);
  });

  if (missingPackages.length === 0) {
    console.log("All dependencies are already installed.");
    return;
  }

  const packageManager = detectPackageManager(projectRoot);
  const installCommand = getInstallCommand(packageManager, missingPackages);

  console.log("Installing missing dependencies: " + missingPackages.join(", "));
  console.log("Running " + packageManager + " " + installCommand.join(" "));

  const result = childProcess.spawnSync(packageManager, installCommand, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    fail("Failed to run " + packageManager + ": " + result.error.message);
  }

  if (result.status !== 0) {
    fail(packageManager + " exited with status " + result.status + ".");
  }
}

function readPackageJson(packageJsonPath) {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    fail("Could not read " + packageJsonPath + ": " + error.message);
  }
}

function hasPackage(packageJson, packageName) {
  return Boolean(
    (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName]) ||
      (packageJson.peerDependencies && packageJson.peerDependencies[packageName]) ||
      (packageJson.optionalDependencies && packageJson.optionalDependencies[packageName])
  );
}

function detectPackageManager(projectRoot) {
  if (fs.existsSync(path.join(projectRoot, "bun.lockb")) || fs.existsSync(path.join(projectRoot, "bun.lock"))) {
    return "bun";
  }

  if (fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(projectRoot, "yarn.lock"))) {
    return "yarn";
  }

  return "npm";
}

function getInstallCommand(packageManager, packages) {
  if (packageManager === "npm") {
    return ["install"].concat(packages);
  }

  return ["add"].concat(packages);
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (error) {
    return false;
  }
}

function fail(message) {
  console.error("Error: " + message);
  process.exit(1);
}

main();
