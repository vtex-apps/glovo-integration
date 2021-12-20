# Glovo Integration

This App allows the European stores to be integrated with the Glovo Marketplace.\
_Note: Latin American stores are not supported_

**Main Features**

- Possibility to add multiple stores with independent catalogs.
- Bulk or partial product update.
- Price and Product Availability Update by Store.
- Order Integration.

## Configuration

_Prior to the following steps, you should have already reached out to Glovo to create the Catalog for the stores you will have available in Glovo, you should upload one catalog that includes all of the products you want to offer on the independent Glovo Stores. The App will take care of managing the availability for each store._

To configure this App please follow these steps:

1.  Run the following command in your store's CLI: `vtex install vtex.glovo-integration@2.x`
2.  Make sure you have at least one (1) pick-up-point configured on the salesChannel you want to offer the integration.
3.  In your Store's Admin dashboard, on the side menu browse to _Apps -> My Apps_ and look for the "Glovo Integration" box and then click on it to open the settings for the app.\
    Fill in the settings as described on each field. - Glovo Token: enter the Token Provided by Glovo - Production Environment: you can switch between Glovo's Test environment and the production environment - Store Settings: Array of stores to be offered on Glovo. - Store ID: Three letter field to identify each store. Should not contain vocals - SalesChannel: input sales channel for this store - Pick Up Point Postal Code: input the postal code configured on the previously defined Pick Up Point - Glovo Store ID: input the Provided Glovo ID for this specific Store - Client Information: fill in the details of a Fake Glovo Customer, all orders will be created using this information for the costumer fields.

4.  Using the example shown below, upload the catalog of your store's products that will be available on Glovo (include all the products from every store) by making a POST request to the following endopoint.

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

5. The catalog of products on Glovo can be updated completely or partially by using this endpoints:

- Complete update

```
curl --request POST \
     --url https://{{account}}.myvtex.com/_v/glovo/menu/update-all \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

- Partial update\
  _The partial update requires the affiliate configuration described on step 5_

```
curl --request POST \
     --url https://{{account}}.myvtex.com/_v/glovo/menu/update-partial \
     --header 'VtexIdClientAutCookie: {authToken}' \
```

5. Inside your Store's Admin, on the side menu go to _Orders Management -> Settings -> Affiliate_ and configure a new [affiliate](https://help.vtex.com/en/tutorial/integration-guide-consuming-catalog-information-for-use-in-an-external-service) as follows:
   - Name: Give the affiliate a name
   - ID: a three (3) letter key for the affiliate (not compatible with numbers or vocals)
   - Trade Policy: number of the trade policy (sales channel) that will be linked to the Glovo Store
   - e-mail: email for notifications
   - Search Enpoint: `https://{{account}}.myvtex.com/_v/glovo/products/update`
