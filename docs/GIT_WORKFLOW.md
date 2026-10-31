# GIT & FOUR-MEMBER COLLABORATION WORKFLOW
## Brightloop Software — Subscription Management System

### 1. Collaborative Monorepo Strategy
This project is built using a **Modular Monolith** pattern.
All four developers contribute to **ONE** central GitHub repository, sharing a single frontend, backend, Prisma schema, and PostgreSQL database.

Each member is assigned their dedicated folder in `members/`:
- **Member 1**: `members/member1/` (Authentication, Users, RBAC, Customer Portal Layout)
- **Member 2**: `members/member2/` (Products, Variants, Plans, Taxes, Discounts)
- **Member 3**: `members/member3/` (Quotations, Templates, Subscriptions Lifecycle)
- **Member 4**: `members/member4/` (Billing Cron, Invoices, Payments, Finance Dashboard)

### 2. Step-by-Step GitHub Workflow

#### Step 1: Repository Owner Setup
1. The repository owner creates the initial GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "chore: initial project scaffold, shared contracts, and member modular monolith"
   git branch -M main
   git remote add origin https://github.com/OWNER_USERNAME/brightloop-subscription-management.git
   git push -u origin main
   ```
2. The owner invites the other three teammates as collaborators via:
   **GitHub Repository -> Settings -> Collaborators -> Add people**.

#### Step 2: Member Clone and Setup
Each member clones the **SAME** repository using their personal GitHub account:
```bash
git clone https://github.com/OWNER_USERNAME/brightloop-subscription-management.git
cd brightloop-subscription-management
npm install
```

#### Step 3: Member Isolated Development
Each member works **strictly inside their assigned folder**:
- Developer 1 modifies only `members/member1/`
- Developer 2 modifies only `members/member2/`
- Developer 3 modifies only `members/member3/`
- Developer 4 modifies only `members/member4/`

#### Step 4: Atomic Commit & Push
When a member completes or updates a feature, they commit only their folder:
```bash
# Example for Member 1:
git add members/member1/
git commit -m "feat(member1): implement user registration, login, and jwt auth"
git push origin main

# Example for Member 2:
git add members/member2/
git commit -m "feat(member2): implement product variants, plans, and tax rules"
git push origin main

# Example for Member 3:
git add members/member3/
git commit -m "feat(member3): implement quotation templates and subscription lifecycle"
git push origin main

# Example for Member 4:
git add members/member4/
git commit -m "feat(member4): implement recurring billing cron, payments, and finance dashboard"
git push origin main
```

### 3. Handling Non-Fast-Forward / Merge Conflicts
Because each developer works in an independent folder (`members/memberN`), Git merges are automatically cleanly handled without file conflicts!

If someone pushed before you, Git may reject your push with:
`[rejected - non-fast-forward]`:

**Resolution Workflow**:
```bash
# Pull the latest main with rebase
git pull --rebase origin main

# If your changes were purely in your members/memberN folder,
# the rebase succeeds automatically!
git push origin main
```

If a conflict ever occurs:
1. Run `git status` to see the conflicted files.
2. Open the file and resolve the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Stage the resolved file: `git add <file>`.
4. Continue the rebase: `git rebase --continue`.
5. Push to GitHub: `git push origin main`.

### 4. Critical Collaboration Rules
1. **Never overwrite another member's folder**: Do not edit `members/memberX` if you are member Y.
2. **Do not independently replace `package.json`**: Dependency additions must be coordinated.
3. **Do not independently replace `prisma/schema.prisma`**: The schema is shared and centralized.
4. **Do not alter `shared/` without consensus**: All interfaces and contracts in `shared/` are agreed upon in advance.
5. **Always pull before pushing**: Run `git pull --rebase origin main` before pushing your commits.
6. **No force-pushing**: `git push --force` is strictly forbidden on `main`.
