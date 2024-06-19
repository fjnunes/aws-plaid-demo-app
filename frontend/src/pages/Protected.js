import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { get } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Button, Text } from '@aws-amplify/ui-react';
import { getItems as GetItems } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';

const logger = new ConsoleLogger("Protected");

const apiName = "plaidapi";

export default function Protected() {
  const [items, setItems] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
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
    setDownloadStatus("Starting download process...");
    
    const pollDownload = async () => {
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
            setDownloadStatus("");
            window.location.href = redirectUrl;
          } else {
            logger.error('No redirect URL found in the response headers');
            setDownloadStatus("Error: No redirect URL found in the response headers");
          }
        } else {
          logger.info('Statements not ready yet, retrying...');
          setDownloadStatus("Statements not ready yet, retrying...");
          setTimeout(pollDownload, 5000); // Retry after 5 seconds
        }
      } catch (err) {
        logger.error('Unable to download statement:', err);
        setDownloadStatus("Error: Unable to download statement. Please try again later.");
      }
    };

    pollDownload();
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <Flex direction="column" align="center" justify="center">
      <View width="100%" display="flex" justifyContent="center">
        <Flex direction="row" align="center" justify="center"> 
          <Plaid label="Add bank accounts" product="statements" getItems={getItems} />
          <Plaid label="Add payroll income" product="income_verification" getItems={getItems} /> 
          <Button onClick={downloadStatements}>Done with linking your accounts? Download all your statements</Button>
        </Flex>
      </View>

      {downloadStatus && (
        <Text>{downloadStatus}</Text>
      )}
            
      {(items && items.length) ? (
        <View>
          <Institutions institutions={items} />
        </View>
      ) : (
        <div />
      )}

    </Flex>
  );
}
