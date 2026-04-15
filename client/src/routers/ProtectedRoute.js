import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const ProtectedRoute = ({
  layout: Layout,
  component: Component,
  isAuthenticated,
  ...rest
}) => {
  const LayoutWrapper = (props) => (
    <Layout>
      <Component {...props} />
    </Layout>
  );

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <LayoutWrapper /> : <Navigate to="/" state={{ from: location }} replace />}
    />
  );
};

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool
};

ProtectedRoute.defaultProps = {
  isAuthenticated: false
};

const mapStateToProps = state => ({
  isAuthenticated: state.authState.isAuthenticated
});

export default connect(mapStateToProps)(ProtectedRoute);
