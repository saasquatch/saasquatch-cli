//@ts-check
import path from 'path';
import Query from '../query/query';
import mkdirp from 'mkdirp';
import util from 'util';
import fs from 'fs';
import LocaleCode from 'locale-code';
import glob from 'glob';
import readline from "readline";

// Allows for interactive keyboard stuff with Ink
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
const fs_writeFile = util.promisify(fs.writeFile);
const fs_readFile = util.promisify(fs.readFile);
const fs_open = util.promisify(fs.open);
const prom_glob = util.promisify(glob);

export async function writingEachAsset({ dir, assetData }) {
  const { name, data } = assetData;

  // TenantTheme per tenant
  if (name === 'TenantTheme') {
    const path = dir + '/TenantTheme';
    mkdirp.sync(path);
    //write default - in root asset folder
    await writeFile({
      data: JSON.stringify(data.variables),
      dir,
      name
    });
    //write translations - in 'TenantTheme' folder
    const translations = data.translationInfo.translations;
    for (let i = 0; i < translations.length; i++) {
      await writeFile({
        data: JSON.stringify(translations[i].content),
        dir: path,
        name: translations[i].locale
      });
    }
  } else {
    //asset per program
    const programRootPath = dir + '/' + name;
    mkdirp.sync(programRootPath);
    //put default in root folder of each program
    for (var i = 0; i < data.length; i++) {
      const assetData = data[i];
      const path = programRootPath + '/' + assetData.__typename;
      mkdirp.sync(path);
      //write default
      if (assetData.__typename === 'ProgramLinkConfig') {
        await writeFile({
          data: JSON.stringify(assetData.messaging),
          dir: path,
          name: 'default'
        });
        const transPath = path + '/default';
        writeTranslation(transPath, assetData);
      } else {
        await writeFile({
          data: JSON.stringify(assetData.values),
          dir: path,
          name: assetData.key
        });
        //write translations
        const transPath = path + '/' + assetData.key;
        await writeTranslation(transPath, assetData);
      }
    }
  }

  return true;
}

export async function getTranslatableAssets({ domain, tenant, auth }) {
  let assetList = [];

  const graphql = Query({
    domain: domain,
    tenant: tenant,
    authToken: auth
  });

  //get Tenant Theme data
  const assets = await graphql.getAssets();

  assets.data.translatableAssets.forEach(asset => {
    const typename = asset.__typename;
    if (typename === 'TenantTheme') {
      assetList.push({ name: 'TenantTheme', id: null, data: asset });
    }
  });

  const programData = await graphql.listProgramAssetData();

  //get available program data
  programData.data.programs.data.forEach(program => {
    const programName = program.name.trim();
    assetList.push({
      name: programName,
      id: program.id,
      data: program.translatableAssets
    });
  });

  return assetList;
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
        root: '/ignored',
        dir: dir,
        base: name
      })
    ) + '.json';
  return fs_writeFile(filePath, data, { encoding: 'utf8' });
}

export async function uploadFile({ path, options }) {
  let { domain, tenant, auth, programId, typename } = options;
  const graphql = Query({
    domain: domain,
    tenant: tenant,
    authToken: auth
  });
  const transId = generateAssetKey({
    typename: typename,
    path: path,
    programId: programId
  });
  let data = null;
  //read file
  try {
    await fs_open(path, 'r');
  } catch (e) {
    console.error(e);
  }

  try {
    data = await fs_readFile(path);
  } catch (e) {
    console.error(e);
  }

  if (data === undefined) {
    console.log(path + ' :data undefined');
  }

  const translationInstanceInput = {
    id: transId,
    content: JSON.parse(data.toString())
  };

  try {
    await graphql.uploadAssets(translationInstanceInput);
  } catch (e) {
    console.error(e);
    process.exit();
  }
  return true;
}

function standardizeLocale(filename) {
  const str = filename.split('.');
  let localeStr = str[0].split('-');
  if (localeStr.length > 1) {
    return localeStr[0] + '_' + localeStr[1];
  } else {
    return localeStr[0];
  }
}

function generateAssetKey({ typename, path, programId }) {
  const map = {
    ProgramEmailConfig: 'e',
    ProgramWidgetConfig: 'w',
    ProgramLinkConfig: 'l'
  };
  const filename = getNameFromPath(path);
  const key = getKeyFromPath(path);
  const locale = standardizeLocale(filename);
  if (typename === 'TenantTheme') {
    return 'TenantTheme' + '/' + locale;
  } else {
    return 'p/' + programId + '/' + map[typename] + '/' + key + '/' + locale;
  }
}

//check if the filename matches the locale format
function validateLocale(dir) {
  let locale = getNameFromPath(dir);
  const temp = locale.split('_');
  if (temp.length > 1) {
    locale = temp[0] + '-' + temp[1];
  }
  return LocaleCode.validate(locale.split('.')[0]);
}

function getNameFromPath(path) {
  const names1 = path.split('\\');
  const names2 = names1[names1.length - 1].split('/');
  return names2[names2.length - 1];
}

function getKeyFromPath(path) {
  const names1 = path.split('\\');
  if (names1.length > 1) {
    return names1[names1.length - 2];
  } else {
    const names2 = path.split('/');
    return names2[names2.length - 2];
  }
}

//put valid keys into a pattern string for directory traversal and validation
function getValidKeyPattern(validKeys) {
  //valid key patterns
  let pattern = '@(';
  validKeys.forEach(key => {
    pattern = pattern + key + '|';
  });
  return pattern.substring(0, pattern.length - 1) + ')';
}

export async function getValidFilelist(options) {
  const validKeys = await getValidKeys(options);

  const validKeyPattern = getValidKeyPattern(validKeys);
  let pattern = null;
  if (fs.lstatSync(options.filepath).isDirectory()) {
    pattern = options.filepath + '/**/' + validKeyPattern + '/*.json';
  } else {
    pattern = options.filepath;
  }
  const allFiles = await prom_glob(pattern, { mark: true });
  return getValidFiles(allFiles, validKeys);
}

function getValidFiles(files, validKeys) {
  return files.filter(filename => {
    let name = filename.split('/');
    if (!validateLocale(name[name.length - 1])) {
      console.log(filename + ' : invalid locale code');
    }
    return (
      validKeys.includes(name[name.length - 2]) &&
      validateLocale(name[name.length - 1])
    );
  });
}

async function getValidKeys(options) {
  let { domain, tenant, auth, typename, programId } = options;
  let assets = null;
  let keys = [];

  if (typename === 'TenantTheme') {
    keys.push('TenantTheme');
  } else if (typename === 'ProgramLinkConfig') {
    keys.push('default');
  } else {
    if (programId === undefined) {
      console.log(
        'Program ID required for ProgramEmailConfig, ProgramWidgetConfig, ProgramLinkConfig'
      );
      process.exit(0);
    }

    const graphql = Query({
      domain: domain,
      tenant: tenant,
      authToken: auth
    });

    try {
      const receivedData = await graphql.getSingleProgramData(programId);
      if (receivedData.data.program) {
        assets = receivedData.data.program.translatableAssets;
      } else {
        console.log(
          'Program with id ' + programId + ' not found in current tenant.'
        );
        process.exit(0);
      }
    } catch (e) {
      console.error(e);
      process.exit(0);
    }

    assets.forEach(asset => {
      if (asset.__typename === typename && !keys.includes(asset.key)) {
        keys = [...keys, asset.key];
      }
    });
  }
  return keys;
}
