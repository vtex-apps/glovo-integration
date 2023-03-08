# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Add backup value for first and last names to avoid errors (`ORD007`) when creating orders.

## [3.4.0] - 2023-03-03

## [3.3.1] - 2023-03-03

### Fixed

- Glovo order modification flow due to changes in VTEX process for order changes when using marketplace architecture.

### Changed

- Remove requests to retrieve `appSettings` from clients to improve perfomance and reduce use of resources.

## [3.3.0] - 2023-02-28

### Added

- New `minimumStock` option on settings to avoid having out of stock products displayed on the Glovo store.

## [3.2.5] - 2023-02-28

### Added

- Support for order changes.
- Additional customer's information on VTEX orders.
- Improvements for error logs.

## [3.1.0] - 2022-12-15

### Added

- Record for menu updates sent to Glovo Stores.

## [3.0.8] - 2022-12-14

### Fixed

- Fix issue with simulation receiving more than 300 items at a time which is not supported.

## [3.0.7] - 2022-12-14

- Increase app resources.

## [3.0.5] - 2022-12-14

### Added

- New `getGlovoMenuByStore` endpoint to retrieve a store's current catalog.

### Added

- New admin panel to manage the Stores and Integration settings.
- New `marketplace` setting to give the option to enable a store as a white label seller.
- More information to the application's logs.

### Changed

- Improved performance and logs for the `updateCompleteMenu` endpoint.

### Fixed

- Bug affecting orders where items that could be fulfilled differ from the items requested in Glovo's order.

## [3.0.3] - 2022-06-21

### Fixed

- Add `paymentData` to payload for creating marketplaceplace orders.
- Calculate `totalValue` from simulation result instead of using the amount received from Glovo.

## [3.0.2] - 2022-06-21

### Fixed

- Problem in logic to process an order as a marketplace or seller white label.

## [3.0.1] - 2022-06-09

### Added

- Add `sellerId` property to stores.
- Add `selllerName`property to stores.
- Add new `marketplace` property to application settings.
- Add `createMarketplaceOrder` and `authorizeMarketplaceOrder` methods to `orders` client.
- Add `customError` to have the option to pass more informative to Splunk logs.

### Changed

- Replace the use of `apps` client with `VBase` to store the application settings.

## [3.0.0] - 2022-06-09

### Added

- New Admin Panel with enhanced UX/UI for managing the application's cofiguration.

## [2.0.5] - 2021-12-13

## [1.0.0] - 2021-07-14

## [0.1.0] - 2021-05-05
