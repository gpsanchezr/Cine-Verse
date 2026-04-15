import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const WithLayoutRoute = ({
  layout: Layout,
  component: Component,
  layoutProps,
  isAuthenticated,
  ...rest
}) => {
  const LayoutWrapper = (props) => (
    <Layout {...layoutProps}>
      <Component {...props} />
    </Layout>
  );

  return (
    <Route
      {...rest}
      element={<LayoutWrapper />}
    />
  );
};

WithLayoutRoute.propTypes = {
  component: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string
};

export default WithLayoutRoute;
