# Version Control Crash Course

This project uses Git for source control and GitHub for collaboration.

1. **Clone the repository**
   ```bash
   git clone git@github.com:AthrvSharma/Cineverse.git
   cd Cineverse
   ```

2. **Create feature branches**
   ```bash
   git checkout -b feature/realtime-dashboard
   ```

3. **Stage and commit granular changes**
   ```bash
   git add .
   git commit -m "Add Redis powered realtime dashboard"
   ```

4. **Push and open a Pull Request**
   ```bash
   git push -u origin feature/realtime-dashboard
   ```

5. **Review + merge**
   - Request reviews on GitHub.
   - Squash/rebase as needed.
   - Merge via PR to `main`.

> Tip: Keep commits small, document architectural decisions in PR descriptions, and use protected branches or rulesets to enforce status checks.
