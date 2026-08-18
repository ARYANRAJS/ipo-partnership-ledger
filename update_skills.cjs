const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const skillsDir = 'C:\\Users\\PC\\.gemini\\config\\skills';
const repos = [
  { name: 'strix', url: 'https://github.com/usestrix/strix.git' },
  { name: 'reticle', url: 'https://github.com/reticlehq/reticle.git' },
  { name: 'emil-skills', url: 'https://github.com/emilkowalski/skills.git' },
  { name: 'impeccable', url: 'https://github.com/pbakaus/impeccable.git' },
  { name: 'taste-skill', url: 'https://github.com/Leonxlnx/taste-skill.git' }
];

console.log('Checking skills in:', skillsDir);

repos.forEach(repo => {
  const targetPath = path.join(skillsDir, repo.name);
  if (fs.existsSync(targetPath)) {
    console.log(`Repository ${repo.name} already exists at ${targetPath}. Fetching updates...`);
    try {
      execSync(`git -C "${targetPath}" pull`, { encoding: 'utf8' });
      console.log(`Updated ${repo.name} successfully.`);
    } catch (e) {
      console.log(`Note on ${repo.name}: ${e.message}`);
    }
  } else {
    console.log(`Cloning ${repo.url} into ${targetPath}...`);
    try {
      execSync(`git clone "${repo.url}" "${targetPath}"`, { encoding: 'utf8' });
      console.log(`Cloned ${repo.name} successfully.`);
    } catch (e) {
      console.log(`Failed to clone ${repo.name}: ${e.message}`);
    }
  }
});
