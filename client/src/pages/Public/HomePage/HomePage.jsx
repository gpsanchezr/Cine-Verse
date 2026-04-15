import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, Box, Grid } from '@material-ui/core';
import {
  getMovies,
  getShowtimes,
  getMovieSuggestion
} from '../../../store/actions';
import MovieCarousel from '../components/MovieCarousel/MovieCarousel';
import MovieBanner from '../components/MovieBanner/MovieBanner';
import styles from './styles';

class HomePage extends Component {
  componentDidMount() {
    const {
      movies,
      showtimes,
      suggested,
      getMovies,
      getShowtimes,
      getMovieSuggestion,
      user
    } = this.props;
    
    // Escudo para evitar errores si las props son undefined inicialmente
    if (!movies?.length) getMovies();
    if (!showtimes?.length) getShowtimes();
    if (user && !suggested?.length) {
      getMovieSuggestion(user.username);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      this.props.user &&
        this.props.getMovieSuggestion(this.props.user.username);
    }
  }

  render() {
    const {
      classes,
      randomMovie,
      comingSoon,
      nowShowing,
      suggested
    } = this.props;
    
    return (
      <Fragment>
        {/* Solo renderiza el Banner si existe la película aleatoria */}
        {randomMovie && <MovieBanner movie={randomMovie} height="85vh" />}
        <Box height={60} />
        
        <MovieCarousel
          carouselClass={classes.carousel}
          title="Suggested for you"
          movies={suggested || []} 
        />
        <MovieCarousel
          carouselClass={classes.carousel}
          title="Now Showing"
          to="/movie/category/nowShowing"
          movies={nowShowing || []} 
        />
        <MovieCarousel
          carouselClass={classes.carousel}
          title="Coming Soon"
          to="/movie/category/comingSoon"
          movies={comingSoon || []} 
        />
      </Fragment>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
  movies: PropTypes.array,
  suggested: PropTypes.array,
  nowShowing: PropTypes.array,
  comingSoon: PropTypes.array
};

// Aquí estaba el error: agregamos ?. y || [] para proteger el estado inicial
const mapStateToProps = (state) => ({
  movies: state?.movieState?.movies || [],
  randomMovie: state?.movieState?.randomMovie || null,
  latestMovies: state?.movieState?.latestMovies || [],
  comingSoon: state?.movieState?.comingSoon || [],
  nowShowing: state?.movieState?.nowShowing || [],
  showtimes: state?.showtimeState?.showtimes || [],
  suggested: state?.movieState?.suggested || [],
  user: state?.authState?.user || null
});

const mapDispatchToProps = { getMovies, getShowtimes, getMovieSuggestion };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(HomePage));