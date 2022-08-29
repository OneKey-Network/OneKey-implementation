import path from 'path';
import fs from 'fs';
import { EOL, type } from 'os';
import { VHostApp } from '@core/express/express-apps';
import { getAppsAndNodes } from '../src/apps';

if (!(process.argv[2]?.length > 0)) {
  const scriptName = path.basename(__filename);
  console.error(`Usage: sudo ts-node ${scriptName} <add|remove>
Example: sudo ts-node ${scriptName} add`);
  process.exit(1);
}

const pattern = '# [PAF]';

const action = process.argv[2];

const hostsFile =
  type() === 'Linux' || type() === 'Darwin' ? '/etc/hosts' : 'C:\\Windows\\System32\\Drivers\\etc\\hosts';

(async () => {
  let content = (await fs.promises.readFile(hostsFile))
    .toString()
    .split(EOL)
    .filter((n) => !n.includes(pattern))
    .join(EOL);

  if (action === 'remove') {
    // The content is already cleaned
  } else if (action === 'add') {
    const { websites, clientNodes, operators, cdns } = await getAppsAndNodes();

    const allApps: VHostApp[] = [
      ...websites,
      ...cdns,
      ...operators.map((operator) => operator.app),
      ...clientNodes.map((clientNode) => clientNode.app),
    ];

    for (const app of allApps) {
      content += `127.0.0.1 ${app.hostName} ${pattern} ${app.name}${EOL}`;
    }
  } else {
    console.error(`Unsupported action ${action}`);
    process.exit(1);
  }

  await fs.promises.writeFile(hostsFile, content);

  process.exit(0);
})();
