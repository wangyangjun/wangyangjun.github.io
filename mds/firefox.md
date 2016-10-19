## Firefox with Kiosk Mode 
---
### Introduction
In some case, application is running in a brower with kiosk mode. In this article, we will introduce how to install Firefox with add-ons(R-kiosk) automaticlly without any manually action.


### Install extensions automatically

With command `firefox -install-global-extension addon.xpi` to install an addon, we still need to click the Install button manually. 

Firefox does not need the addon file name but the identifier from the addon as a package name. That means that if you are planning on installing an addon without user intervention you need to extract it to a folder with the name of the addon identifier string, not the name of the addon.


**Global addon install**

If you want to install an extension automatically to all users in your system you need to extract it, rename the folder that contains the addon to the addon's id string and copy it to the firefox global extensions folder /usr/share/mozilla/extensions/, anything that you use there will be called up automatic when a user opens firefox.

**User specific install**

Copy the extension folder to the firefox user extensions folder /home/user_name/.mozilla/extensions/


### Prepare new extension 
Steps to install a new add-on:
```

mkdir -p ~/extensions/addon
cd ~/extensions/addon
// download add-on package file *.xpi;
wget https://addons.mozilla.org/firefox/downloads/latest/1865/addon.xpi
unzip ~/extensions/addon/addon.xpi
rm ~/extensions/addon/addon.xpi

// open install.rdf and find <em:id>id</em:id>, for example the id is {d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}
// rename the addon folder to the id
mv ~/extensions/addon ~/extensions/{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}

```


### Preferences
To write customized preference

Create a js file under folder firefox/defaults/pref/ with following contains
```
pref("general.config.filename", "mozilla.cfg");
pref("general.config.obscure_value", 0);
```

create file `mozilla.cfg` in firefox folder

To enable extensions, following two preferences are set
```
lockPref("xpinstall.signatures.required", false); // disable signatures check, it allows we modify extensions
lockPref("extensions.autoDisableScopes", 0); // make extensions enabled by default
user_pref("browser.startup.homepage", "http://localhost"); // set home page 
```

