# One Minute Insights

> 1 concept · 1 quiz · every day

A mobile-first micro-learning app for Akamai cloud and infrastructure concepts. Each lesson delivers one idea in under a minute — analogy → how it works → real world → takeaway — followed by a quiz and curated resources.

**Live:** [cloudbytes.fde-demo.com](https://cloudbytes.fde-demo.com)

---

## Tracks

| # | Track | Concepts | Description |
|---|-------|----------|-------------|
| 1 | Linode Core | 6 | Compute, LKE, Object Storage, NodeBalancers, VPC, Managed DBs |
| 2 | Akamai Edge | 6 | CDN, EdgeWorkers, App Protector, mPulse, GTM, EdgeKV |
| 3 | Partner Ecosystem | 6 | ISV integrations and Akamai marketplace |
| 4 | Akamai Functions | 6 | EdgeWorkers, EdgeKV, Fermyon Spin/Wasm |
| 5 | AI Brand Presence | 6 | Akamai AI positioning, Bot Manager AI, edge inference |
| 6 | Media & Streaming | 6 | AMD, MSL, Download Delivery, media workflows |
| 7 | AI/ML on Linode | 6 | GPU instances, model serving, vector databases, ML pipelines |
| 8 | DevOps & IaC | 6 | Terraform, Ansible, CI/CD, GitOps, Packer, monitoring |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro](https://astro.build) v5 (static site generation) |
| UI Islands | [Preact](https://preactjs.com) (interactive quiz + progress tracking) |
| Content | JSON files with Zod schema validation at build time |
| Styling | Vanilla CSS with per-track theme variables |
| Hosting | Linode Nanode (Nginx) at `cloudbytes.fde-demo.com` |
| SSL | Let's Encrypt via Certbot |
| CI/CD | GitHub Actions → rsync to Linode |

---

## Project Structure

```
src/
  content/
    tracks/          # Track metadata (8 JSON files)
    concepts/        # Concept data per track (6 JSON files each)
  pages/
    index.astro      # Home — track cards
    tracks/[id]      # Track detail + concept list
    lessons/[id]     # Step-by-step lesson
    quiz/[id]        # Interactive quiz (Preact island)
    resources/[id]   # Curated resources with links
  components/
    QuizIsland.tsx   # Preact: interactive quiz with scoring
    LessonIsland.tsx # Preact: lesson step navigation
  layouts/
    BaseLayout.astro # HTML shell, fonts, theme CSS
  styles/
    global.css
    themes/          # Per-track color themes (7 files)
infra/               # Terraform for Linode infrastructure
terraform-examples/  # 12 annotated Terraform examples
```

---

## Running Locally

```bash
npm install
npm run dev          # http://localhost:4321
```

Build for production:

```bash
npm run build
npm run preview      # Preview the built site
```

---

## Adding Content

### New concept

1. Create `src/content/concepts/{trackId}/{conceptId}.json`
2. Follow the schema: `id`, `icon`, `title`, `subtitle`, `duration`, `steps[]`, `quiz[]`, `resources`
3. Add the concept ID to the `concepts` array in `src/content/tracks/{trackId}.json`
4. Run `npm run build` — Zod validates the schema at build time

### New track

1. Create `src/content/tracks/{trackId}.json` with track metadata and concept list
2. Add concept JSON files under `src/content/concepts/{trackId}/`
3. Add a theme CSS file in `src/styles/themes/` if needed

---

## Deployment

Pushes to `main` auto-deploy via GitHub Actions (`.github/workflows/deploy.yml`):

```
push to main → npm ci → astro build → rsync dist/ → root@172.232.27.231:/var/www/oneminuteinsight/
```

Manual deploy:

```bash
npm run build
rsync -avz --delete dist/ root@172.232.27.231:/var/www/oneminuteinsight/
```

---

## Infrastructure

Terraform in `infra/` provisions:

- **Linode Nanode** (`g6-nanode-1`, Ubuntu 24.04) — Nginx serving the static build
- **Cloud Firewall** — allow 22/80/443, drop all other inbound
- **DNS A record** — `cloudbytes.fde-demo.com`

See `terraform-examples/` for 12 annotated Terraform patterns covering LKE, Block Storage, GPU inference, VPC, managed databases, and more.

---

## Author

Built by **Saikiran Nair** · [saikiran.nair@gmail.com](mailto:saikiran.nair@gmail.com)
