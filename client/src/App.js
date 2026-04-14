// @ts-nocheck
import React, { Component } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

//Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './store/actions';

import theme from './theme';
import { Alert } from './components';
import { pageCursors } from './utils';
import AppRoutes from './Routes';

import './assets/scss/index.scss';
// import 'typeface-montserrat'; // deprecated, fonts loaded via CSS
import { CssBaseline } from '@material-ui/core';

class App extends Component {
  
  render() {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Alert />
          <AppRoutes />

          
        </ThemeProvider>
      </Provider>
    );
  }
}
export default App;
