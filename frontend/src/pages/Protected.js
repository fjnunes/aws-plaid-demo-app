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
      const response = await fetch('https://7ed2js9stl.execute-api.us-east-1.amazonaws.com/v1/statements/download', {
        method: 'GET',
      });

      if (response.status === 302) {
        const redirectUrl = response.headers.get('Location');
        window.location.href = redirectUrl;
      } else {
        logger.error('Failed to get download URL');
      }
    } catch (err) {
      logger.error('Error downloading statements', err);
    }

    try {
      const { body, statusCode, headers } = await get({
        apiName,
        path: '/v1/statements/download'
      }).response;
      const data = await body.json();
      logger.debug('GET /v1/statements/download response:', data);
      
      if (statusCode === 302) {
        const redirectUrl = headers.get('Location');
        window.location.href = redirectUrl;
      } else {
        logger.error('Failed to get download URL');
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
      <Plaid label="Add Account" product="statements" getItems={getItems} />
      
      <Button onClick={downloadStatements}>Download Statements</Button>

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
