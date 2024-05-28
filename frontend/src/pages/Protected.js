import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { get, post } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

const apiName = "plaidapi";

export default function Protected() {
  const [items, setItems] = useState([]);
  const client = generateClient();

  const getItems = async () => {
    try {
      const res = await client.graphql({
        query: GetItems
      });
      logger.info(res);
      setItems(res.data.getItems.items);
    } catch (err) {
      logger.error('unable to get items', err);
    }
  }

  const downloadStatements = async () => {
    
    try {
      const { body } = await get({
        apiName,
        path: '/v1/statements/download'
      }).response;
      const data = await body.json();
      logger.debug('GET /v1/statements/download response:', data);
      
      if (data.statusCode === 302) {
        const redirectUrl = data.headers.Location;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          logger.error('No redirect URL found in the response headers');
        }
      } else {
        logger.error('Unexpected statusCode:', data.statusCode);
      }

    } catch (err) {
      logger.error('unable to download statement:', err);
    }
  }

  useEffect(() => {
    getItems();
  }, []);

  return (
    <Flex direction="column">
      <Plaid label="Add a new account" product="statements" getItems={getItems} />
      <Button onClick={downloadStatements}>Done with linking your accounts? Click here to download your statements</Button>

      {(items && items.length) ? (
        <View>
          <Heading>Institutions</Heading>
          <Institutions institutions={items} />
        </View>
      ) : (
        <div />
      )}
    </Flex>
  );
}
