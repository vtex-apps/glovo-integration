# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
