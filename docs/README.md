# Glovo Integration

This App allows the European stores to be integrated with the Glovo Marketplace.

**Main Features**

- Possibility to add multiple stores with independent catalogs
- Bulk or partial product update.
- Price and Product Availability Update by Store
- Order Integration

**Latin American stores do not work**

**Configuration**

**Prior to the following steps, you should have reached out to Glovo to create the Catalog for the stores you will have available in Glovo, you should upload one catalog that is inclusive of all the products you want to offer on the independent Glovo Stores. The App will take care of managing the availability for each store.**

To configure this App please follow these steps:

1.  Go to your store CLI and run: `vtex install vtex.glovo-integration@0.x`
2.  You should make sure you have 1 pick-up-point configured on the salesChannel you want to offer the integration.
3.  Go to your Store's Amdmin, on the side menu browse to _Apps -> My Apps_ And look for the "Glovo Integration" Box, click on it.
    And fill in the settings as described on each field.

            Glovo Token: enter the Token Provided by Glovo
            Production Environment: you can switch between Glovo's Test environment and the production environment
            Store Settings: Array of stores to be offered on Glovo.
                Store ID: Three letter field to identify each store. Should not contain Vocals
                SalesChannel: input sales channel for this store
                Pick Up Point Postal Code: input the postal code configured on the previously defined Pick Up Point
                Glovo Store ID: input the Provided Glovo ID for this specific Store
            Client Information: fill in the details of a Fake Glovo Customer, all orders will be created using this customer.

4.  To create the initial records you can use the following endpoints:

- Glovo Menu: this record contains the list of products ids:

```
curl --request POST \
     --url https://app.io.vtex.com/vtex.glovo-integration/v0/vtexspain/clerkiofeed/_v/glovo/glovo-menu/save \
     --header 'VtexIdClientAutCookie: {authToken}' \
     --data '
        {
            "productId": true,
            "productId": true,
            "productId": true,
            .
            .
            .
            "productId": true,
        }
     '
```

- Store Menu Updates: this records contains the items to be updated for each store:
  The items list can be empty or contain the products with the initial information.

```
curl --request POST \
     --url https://app.io.vtex.com/vtex.glovo-integration/v0/vtexspain/clerkiofeed/_v/glovo/menu-updates/save \
     --header 'VtexIdClientAutCookie: {authToken}' \
     --data '
        {
            "storeId": string,
            "glovoStoreId": string,
            "items": [
                {
                    id: string,
                    price: number,
                    available: boolean
                }
            ]
        }
     '
```

- Product records: this records are created automatically when receiving a catalog update for the product if they don't exist. Alternatively, this can be created manually:

```
curl --request POST \
     --url https://app.io.vtex.com/vtex.glovo-integration/v0/vtexspain/clerkiofeed/_v/glovo/product-record/save \
     --header 'VtexIdClientAutCookie: {authToken}' \
     --data '
        {
            "storeId": string,
            "skuId": string,
            "data":
                {
                    id: string,
                    price: number,
                    available: boolean
                }

        }
     '
```

4. The menu on Glovo can be updated completely or partially by using this endpoints:

- Complete update

```
curl --request POST \
     --url https://clerkiofeed--vtexspain.myvtex.com/_v/glovo/menu/update-all \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

- Partial update

```
curl --request POST \
     --url https://clerkiofeed--vtexspain.myvtex.com/_v/glovo/menu/update-partial \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

5. (optional) inside your Store's Admin, on the side menu go to _Orders Management -> Settings -> Affiliate_ and configure a new [affiliate](https://help.vtex.com/en/tutorial/integration-guide-consuming-catalog-information-for-use-in-an-external-service) as follows:

   Name = Give the affiliate a name

   ID = a 3 letter key for the affiliate (not compatible with numbers or vocals)

   Trade Policy = number of the trade policy that will be linked to the Glovo Store

   e-mail = email for notifications

   Search Enpoint = leave empty

This optional step will allow you to filter the OMS settings
