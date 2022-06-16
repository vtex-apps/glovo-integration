# Glovo Integration

The Glovo Integration allows European stores to be integrated with the Glovo Marketplace.\
_Note: Latin American stores are not supported_

## Main Features

- **Possibility to add multiple stores with independent catalogs**.
- **Product catalog update for stores** - Updates to the store's catalogs can be scheduled to keep prices and product availability up to date.
- **Order Integration** - The orders received from Glovo are integrated into VTEX.

## Configuration

_Prior to the following steps, you should have already reached out to Glovo to create the Catalog for the stores you will have available in Glovo, you should upload one catalog that includes all of the products you want to offer on the independent Glovo Stores. The App will take care of managing the availability for each store._

To configure the Glovo Integration you can follow these steps:

1. Run the following command in your store's CLI: `vtex install vtex.glovo-integration@3.x`
2. Make sure you have at least one (1) pick-up-point configured for each of the salesChannel where you want to offer the integration.
3. In your store's admin dashboard, on the side menu browse to **Apps -> Glovo Integration** and then click on it to open the application settings.\
4. Add the stores that will integrate with Glovo:

| Field          | Description                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Store name     | Display name associated to the store                                                                                               |
| Seller ID      | Seller ID associated to the store (the dropdown displays the seller's name)                                                        |
| Affiliate ID   | Three letters ID associated for the affiliate (you can find this ID going to **Store settings -> Orders' settings -> Affiliates**) |
| Sales channel  | The sales channel associated to the store                                                                                          |
| Postal code    | The postal code for the store in charge of fulfilling the orders from Glovo                                                        |
| Country        | The country where the store is located                                                                                             |
| Glovo Store ID | Glovo store ID assigned to the store by Glovo                                                                                      |

5. Fill in the the integration settings and client information:

| Field                  | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| Glovo Token            | Glovo token (app key) provided by Glovo to connect to their APIs          |
| Marketplace            | Toggle to use a marketplace configuration                                 |
| Production Environment | Toggle between Glovo's Test environment and production environment        |
| Client information     | All orders will be created using this information for the customer fields |

6.  Using the example shown below, upload the catalog of your store's products that will be available on Glovo (include all the products from every store) by making a POST request to the following endpoint.

```
curl --request POST \
     --url https://app.io.vtex.com/vtex.glovo-integration/v2/{{account}}/{{workspace}}/_v/glovo/glovo-menu/ \
     --header 'VtexIdClientAutCookie: {authToken}' \
     --data '
        [
            "productId",
            "productId",
            "productId",
            .
            .
            .
            "productId",
        ]
     '
```

7. The catalog of products offered on Glovo can be updated completely or partially by using the following endpoints:

- **Complete update** - This endpoint will send a bulk update to every store for all the products in the menu.

```
curl --request POST \
     --url https://{{account}}.myvtex.com/_v/glovo/menu/update-all \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

- **Partial update** - This endpoint will send a bulk update to every store only for products that have changed since the last update.\
  _The partial update requires the affiliate configuration described on step 5_

```
curl --request POST \
     --url https://{{account}}.myvtex.com/_v/glovo/menu/update-partial \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

8. Inside your store's admin dashboard, on the side menu go to _Orders Management -> Settings -> Affiliate_ and configure a new [affiliate](https://help.vtex.com/en/tutorial/integration-guide-consuming-catalog-information-for-use-in-an-external-service) as follows:

   - Name: Give the affiliate a name
   - ID: a three (3) letter key for the affiliate (not compatible with numbers or vocals)
   - Trade Policy: number of the trade policy (sales channel) that will be linked to the Glovo Store
   - e-mail: email for notifications
   - Search Enpoint: `https://{{account}}.myvtex.com/_v/glovo/products/update`

## Store Menu

It is possible to see the current catalog offered in Glovo for any of the stores that have been added to the configuration. \
The following endpoint will respond with the store's current catalog and generate a new updated record in the background.

```
curl --request GET \
     --url https://app.io.vtex.com/vtex.glovo-integration/v3/{{account}}/{{workspace}}/_v/glovo/get-menu/{{affiliateId}}' \
     --header 'VtexIdClientAutCookie: {authToken} \
```

_The response has a property called `lastUpdated` that shows you the last date in which the the record was generated._
