import React from 'react';

import Layout from '../components/layout';
import Table from '../components/table';
import cookingRecipes from '../data/cooking';
import prices from '../data/prices';

const IndexPage = () => (
  <Layout>
    <Table showTool recipes={cookingRecipes} {...{ prices }} />
  </Layout>
);

export default IndexPage;
