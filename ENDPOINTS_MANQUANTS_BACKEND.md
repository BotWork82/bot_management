# Endpoints backend etat d'integration frontend

Ce document indique les routes deja integrees dans le frontend. Les routes marquees "a fournir" doivent exister cote backend.

## LoginPage

- Routes integrees:
  - POST /auth/login
  - POST /logout

- Routes integrees recommandees:
  - POST /auth/refresh (renouvellement de token)
  - GET /auth/me (verification session au reload)

## DashboardPage

- Routes integrees:
  - GET /dashboard/summary
    - Retour attendu: cartes de synthese (label, value, helper, iconKey)
  - GET /dashboard/weekly-interactions
    - Retour attendu: tableau de 7 valeurs numeriques (lun -> dim)
  - GET /dashboard/recent-activity
    - Retour attendu: liste d'activites recentes (title, description, time, type)

## ProductsPage

- Routes integrees:
  - GET /products?page=&take=&category_id=&farm_id=&q=
  - GET /products/:id
  - POST /products (multipart: image, video, variants, price, category_id, farm_id)
  - PATCH /products/:id (multipart)
  - DELETE /products/:id

- Statut: aucune route bloquante manquante cote frontend

## CategoriesPage

- Routes integrees:
  - GET /categories?page=&take=
  - POST /categories
  - PATCH /categories/:id
  - DELETE /categories/:id

- Statut: aucune route bloquante manquante cote frontend

## FarmsPage

- Routes integrees:
  - GET /farms?page=&take=&q=
  - GET /farms/:id
  - POST /farms
  - PATCH /farms/:id
  - DELETE /farms/:id

- Statut: aucune route bloquante manquante cote frontend

## MessagesPage

- Routes integrees:
  - GET /messages?page=&take=&box=
  - GET /messages/:id
  - POST /messages
  - PATCH /messages/:id
  - PATCH /messages/:id/send
  - DELETE /messages/:id

- Routes integrees recommandees:
  - POST /messages/:id/schedule (envoi programme)
  - GET /messages/stats (ouverture, clic, delivery)

## MediaPage

- Routes integrees:
  - GET /media?page=&take=&q=
  - GET /media/:id
  - POST /media (multipart)
  - GET /media/:id/download
  - DELETE /media/:id

- Routes integrees recommandees:
  - PATCH /media/:id (renommer/metadata)

## StatisticsPage

- Routes integrees:
  - GET /statistics/overview
    - Retour attendu: totalMessages, totalProducts, totalUsers
  - GET /statistics/weekly-series
    - Retour attendu: serie temporelle pour graphes

## UsersPage

- Routes integrees:
  - GET /users?page=&take=
  - GET /users/:id
  - POST /users
  - PATCH /users/:id
  - DELETE /users/:id
  - GET /users/my-account
  - PATCH /users/my-account/password
  - PATCH /users/password (reset admin)

- Routes integrees recommandees:
  - GET /users/:id/activity (historique)

## SettingsPage

- Routes integrees:
  - GET /settings
  - PATCH /settings

- Routes optionnelles non integrees:
  - GET /settings/integrations
  - PATCH /settings/integrations

## Notes de format de reponse backend

- Le front accepte principalement un format pagine:
  - { items: [...], total: number, page?: number, take?: number }

- Pour compatibilite actuelle, certains ecrans tolerent aussi:
  - { content: [...] }
