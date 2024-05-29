import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator, Button, Heading, View } from '@aws-amplify/ui-react';

export default function Layout() {
  const { route, signOut, user } = useAuthenticator((context) => [
    context.route,
    context.signOut,
    context.user
  ]);
  const navigate = useNavigate();

  function logOut() {
    signOut();
    navigate('/login');
  }
  return (
    <>
      <nav>
        <Button onClick={() => navigate('/')}>Home</Button>
        {route !== 'authenticated' ? (
          <Button onClick={() => navigate('/login')}>Login</Button>
        ) : (
          <Button onClick={() => logOut()}>Logout</Button>
        )}
      </nav>
      <Heading level={2}>Lab360 Disclosures</Heading>
      <View>
        {/* {route === 'authenticated' ? `Welcome ${user.signInDetails?.loginId}` : 'Please Login!'} */}
        <p>Statements from all your accounts in one place: checking, savings, brokerages, retirement, student loans, mortgages, etc.</p>
      </View>

      <Outlet />
    </>
  );
}
