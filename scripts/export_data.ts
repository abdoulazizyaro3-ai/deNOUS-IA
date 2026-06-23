import fs from 'fs';
import { countriesData } from '../src/data/explore-africa/data';
import { countriesDetails } from '../src/data/explore-africa/countryDetails';

const output = {
  countriesData,
  countriesDetails
};

fs.writeFileSync('explore_data.json', JSON.stringify(output, null, 2));
console.log('explore_data.json created successfully!');
