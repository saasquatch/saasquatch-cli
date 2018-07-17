//@ts-check
import path from "path";
import Query from "./query/query";
import mkdirp from "mkdirp";
import util from "util";
import fs from "fs";

const fs_writeFile = util.promisify(fs.writeFile);

export async function downloadSingleAsset({
  dir,
  name,
  tenantThemeData,
  programMap,
  options
}) {
  const { domainname, tenant, auth } = options;

  if (name === "TenantTheme") {
    const path = dir + "/TenantTheme";
    mkdirp.sync(path);
    //write default - in root asset folder
    await writeFile({
      data: JSON.stringify(tenantThemeData.variables),
      dir,
      name
    });
    //write translations - in 'TenantTheme' folder
    const translations = tenantThemeData.translationInfo.translations;
    for (let i = 0; i < translations.length; i++) {
      await writeFile({
        data: JSON.stringify(translations[i].content),
        dir: path,
        name: translations[i].locale
      });
    }
  } else {
    //per program
    const programId = programMap[name];

    const receivedData = await Query({
      domain: domainname,
      tenant: tenant,
      authToken: auth
    }).getProgramData(programId);

    const programData = receivedData.data.program;

    const programRootPath = dir + "/" + name;
    mkdirp.sync(programRootPath);
    //put default in root folder of each program
    const assets = programData.translatableAssets;
    for (var i = 0; i < assets.length; i++) {
      const assetData = assets[i];
      const path = programRootPath + "/" + assetData.__typename;
      mkdirp.sync(path);
      //write default
      if (assetData.__typename === "ProgramLinkConfig") {
        await writeFile({
          data: JSON.stringify(assetData.messaging),
          dir: path,
          name: "default"
        });
        const transPath = path + "/default";
        writeTranslation(transPath, assetData);
      } else {
        await writeFile({
          data: JSON.stringify(assetData.values),
          dir: path,
          name: assetData.key
        });
        //write translations
        const transPath = path + "/" + assetData.key;
        await writeTranslation(transPath, assetData);
      }
    }
  }

  return true;
}

export async function findTranslatableAssets({ domainname, tenant, auth }) {
  let listItem = [];
  let programMap = {};
  let tenantThemeData;

  const graphql = Query({
    domain: domainname,
    tenant: tenant,
    authToken: auth
  });

  //get Tenant Theme
  const assets = await graphql.getAssets();

  assets.data.translatableAssets.forEach(asset => {
    const typename = asset.__typename;
    if (typename === "TenantTheme") {
      tenantThemeData = asset;
      listItem.push({name:"TenantTheme", translatableAssetKey:asset.translatableAssetKey, data: asset});
    }
  });

  const programData = await graphql.listPrograms();

  programData.data.programs.data.forEach(program => {
    const programName = program.name.trim();
    listItem.push({name:programName, translatableAssetKey:program.id + "/*"});
    programMap[programName] = program.id;
  });

  return { programData, programMap, tenantThemeData, listItem };
}

function writeTranslation(transPath, assetData) {
  const translations = assetData.translationInfo.translations;
  mkdirp.sync(transPath);
  for (let i = 0; i < translations.length; i++) {
    writeFile({
      data: JSON.stringify(translations[i].content),
      dir: transPath,
      name: translations[i].locale
    });
  }
}

function writeFile({ data, dir, name }) {
  const filePath =
    path.normalize(
      path.format({
        root: "/ignored",
        dir: dir,
        base: name
      })
    ) + ".json";

  return fs_writeFile(filePath, data, { encoding: "utf8" });
}
