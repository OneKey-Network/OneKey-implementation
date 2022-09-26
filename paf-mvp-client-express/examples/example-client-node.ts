/* eslint @typescript-eslint/no-unused-vars: 0 */
import { ClientNode } from '@onekey/client-node/client-node';

// Here is how the client is created. See config.json and public-key.pem, private-key.pem files
(async () => {
  const clientNode = await ClientNode.fromConfig('./config.json');
})();
