# Glovo Integration

This App allows the European stores to be integrated with Glovo Marketplace.

**Main Features**

- Possibility to add multiple stores with independent catalogs
- Price and Product Update by Store
- Order Integration

**Latin American stores do not work**

**Configuration**

**Prior to the following steps, you should have reached out to Glovo to create the Catalog for each store you will have available in Glovo**

To configure this App please follow these steps:
1. Go to your store CLI and run: ```vtex install vtex.glovo-integration@0.x```

2. Once installed inside your Store's Admin, on the side menu go to *Orders Management -> Settings -> Affiliate* and configure a new [affiliate](https://help.vtex.com/en/tutorial/integration-guide-consuming-catalog-information-for-use-in-an-external-service) as follows:

    Name = Give the affiliate a name
    
    ID = a 3 letter key for the affiliate (not compatible with numbers or vocals)
    
    Trade Policy = number of the trade policy that will be linked to the Glovo Store
    
    e-mail = email for notifications
    
    Search Enpoint = https://{{accountName}}.myvtex.com/_v/glovo/products/update 

3. Still on your Store's Amdmin, on the side menu browse to *Apps -> My Apps*  And look for the "Glovo Integration" Box, click on it.
And fill in the settings as described on each field. 
Each store configured on the app should be paired with an affiliate and a SalesChannel. 

