# New approach

Use an Mobile App along with Web App to manage shopping and improve the existing flow.

## Improvements

The items now should be grouped by a market list, which should:
- Set the context, to be able to include all kind of shopping, for exemple grocery or pet stores.
    - Include a new field for the kind of shopping.
    - Include a new field for the place where the shopping was done.
    - Include a new optional field for the name, when not set, should default to "PLACE - DATE".
- Include a new field for the date, removing from the individual item.
- In the item, should:
    - Include a new optional field for barcode, to easy map the item.
    - The quantity field should be now a floating value, to represent value by weight.

## For Mobile App and Web App

Both apps should be capable of:
- Manage [kind of shopping](./required-data-management.md). In the Kind of shopping page:
    - List all created contexts. At least one should exists, called "default".
    - Button to create new kind, by adding the name of context.
    - Edit the name from existing kind.
    - Delete existing kind. Once deleting, all other items that depend on it should change to the "default".
- Manage [item type by kind](./required-data-management.md).
    - List all created types, filtered by the kind. At least one should exists, called "undefined".
    - Button to create new type, by adding the name of type and linking with the kind, initialize with "default".
    - Edit the name from existing type.
    - Delete existing type. Once deleting, all other types that depend on it should change to `NULL`.
    - Can be created during item management.
- Manage [item location](./required-data-management.md).
    - List all created locations.
    - Button to create new location.
    - Edit the name from existing location.
    - Delete existing type.
    - Can be created during item management.
- Manage [market list place](./required-data-management.md).
    - List all created places.
    - Button to create new place.
    - Edit the name from existing place.
    - Delete existing place.
    - Can be created during market list management.
- Manage market list by kind.
    - List all created market list, filtered by the kind and date.
    - Button to create new market list, by adding the date, place, name of list (optional), linking with the kind and adding the list of items.
        - The list items should contain the product name, type, location, quantity, unit value, optional barcode, and display the total
    - Edit details of the list and the items.
    - Delete items from the list or the whole list.

### For Mobile App

Should be able to handle offline first. A local database should exists and synchronize the cloud.
- The local database should have the relevant data, along with a cloud modified date, local modified date and synchronized flag.
- When the flag is true and both modified date are almost the same (with few seconds or minutes of difference) that means the data is synchronized.
- When the flag is false and local modified date is ahead, that means that local data need to be sent to the could.
- Before synchronizing, need to fetch the item from the cloud.
    - If the cloud modified date is the same, that means that the data wasn't changed and the new data can be uploaded.
    - If the cloud modified date has changed, that means that the data was changed elsewhere and the user need to decide which version to keep.

### For Web App

Should be able to have dashboards and charts for data analysis.

## Import data

An especial flow is needed to be able to import the data from the notion tables.
