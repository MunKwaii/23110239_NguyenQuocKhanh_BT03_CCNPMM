# ExpressJS01

## Seed san pham tai nghe

Yeu cau: dat `MONGO_DB_URL` trong file `.env` hoac environment.

Chay seeding (xoa du lieu cu va them moi):

```powershell
npm run seed:products
```

Chi append (giu du lieu cu):

```powershell
npm run seed:products:append
```

Dry-run (khong ket noi DB, chi kiem tra danh sach):

```powershell
npm run seed:products:dry
```

## Kiem tra du lieu san pham

```powershell
npm run check:products
```

## API san pham

- `GET /v1/api/products?filter=new&limit=8`
- `GET /v1/api/products?filter=best&limit=8`
- `GET /v1/api/products?filter=promo&limit=8`

Yeu cau token tu login (Authorization: Bearer ...).
