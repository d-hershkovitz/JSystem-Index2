# Jsystem-Index2
This Project contains Tool i created to help filtering Failed tests by Failures or Testers for Jsystem Logs

Can only run on Linux machines.

The scripts creates a file called `index2.html`. The Data loads automatically when openning the page.

### How To run:
```sh
./getResuts "Jsystem logs Current folder"
```

### Example:
```sh
./getResuts "/root/develop/jsystem/log/current"
```


 
### Script Files
The script creates 2 files: 
 - `index2.html` - Same as index.html. Frameset which calls output3.html page instead of the default one (report2.html).
 - `output3.html` - The dynamic content created from the report2.html.


### output3 structure:
- `up.html` - The start of index2 page. includes the css and javascripts to use.
- `down.html` - end of page.
- `results.js` - The Javascript code that loads and parse report2.html.
- `testMapping.js` - Mapping of the tests and Features/scenarios.
