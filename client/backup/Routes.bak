import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Loading from './components/Loading';
import { ProtectedRoute, WithLayoutRoute } from './routers';

import { AdminLayout, PublicLayout } from './layouts';

// Admin
const DashboardPage = lazy(() => import('./pages/Admin/Dashboard'));
const MovieList = lazy(() => import('./pages/Admin/MovieList'));
const CinemaList = lazy(() => import('./pages/Admin/CinemaList'));
const ShowtimeList = lazy(() => import('./pages/Admin/ShowtimeList'));
const ReservationList = lazy(() => import('./pages/Admin/ReservationList'));
const User = lazy(() => import('./pages/Admin/User'));
const Account = lazy(() => import('./pages/Admin/Account'));

// Register - Login
const Register = lazy(() => import('./pages/Public/Register'));
const Login = lazy(() => import('./pages/Public/Login'));

// Public
const HomePage = lazy(() => import('./pages/Public/HomePage'));
const MoviePage = lazy(() => import('./pages/Public/MoviePage'));
const MyDashboard = lazy(() => import('./pages/Public/MyDashboard'));
const MovieCategoryPage = lazy(() =>
  import('./pages/Public/MovieCategoryPage')
);
const CinemasPage = lazy(() => import('./pages/Public/CinemasPage'));
const BookingPage = lazy(() => import('./pages/Public/BookingPage'));

const Checkin = lazy(() => import('./pages/Public/Checkin'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <WithLayoutRoute
            path="/checkin/:reservationId"
            element={<Checkin />}
            layout={PublicLayout}
          />

          <WithLayoutRoute
            path="/"
            element={<HomePage />}
            layout={PublicLayout}
          />
          <WithLayoutRoute
            path="/mydashboard"
            element={<MyDashboard />}
            layout={PublicLayout}
          />
          <WithLayoutRoute
            path="/cinemas"
            element={<CinemasPage />}
            layout={PublicLayout}
          />
          <WithLayoutRoute
            path="/movie/category/:category"
            element={<MovieCategoryPage />}
            layout={PublicLayout}
          />
          <WithLayoutRoute
            path="/movie/:id"
            element={<MoviePage />}
            layout={PublicLayout}
            layoutProps={{ withFooter: false }}
          />
          <WithLayoutRoute
            path="/movie/booking/:id"
            element={<BookingPage />}
            layout={PublicLayout}
            layoutProps={{ withFooter: false }}
          />
          <ProtectedRoute
            path="/admin/dashboard"
            element={<DashboardPage />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/users"
            element={<User />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/showtimes"
            element={<ShowtimeList />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/reservations"
            element={<ReservationList />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/cinemas"
            element={<CinemaList />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/movies"
            element={<MovieList />}
            layout={AdminLayout}
          />
          <ProtectedRoute
            path="/admin/account"
            element={<Account />}
            layout={AdminLayout}
          />
          <Route path="*" element={() => <div>404 NOT FOUND</div>} />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default AppRoutes;
