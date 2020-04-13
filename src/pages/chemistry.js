import React from 'react';

import Layout from '../components/layout';
import Table from '../components/table';
import chemistryRecipes from '../data/pharmacy';
import prices from '../data/prices';

const IndexPage = () => (
  <Layout>
    <Table recipes={chemistryRecipes} {...{ prices }} />
  </Layout>
);

export default IndexPage;
