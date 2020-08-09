module.exports = {
  getCityFromGoogleResponse: (results) => {
    let storableLocation = {};

    for (var ac = 0; ac < results[0].address_components.length; ac++) {
      var component = results[0].address_components[ac];

      if (
        component.types.includes("sublocality") ||
        component.types.includes("locality")
      ) {
        storableLocation.city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        storableLocation.state = component.short_name;
      } else if (component.types.includes("country")) {
        storableLocation.country = component.long_name;
        storableLocation.registered_country_iso_code = component.short_name;
      }
    }

    return storableLocation;
  },
};
