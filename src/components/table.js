import React, { useState } from 'react';
import sortBy from 'lodash/sortBy';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import pullAt from 'lodash/pullAt';
import classnames from 'classnames';
import isSubsequence from '@extra-array/is-subsequence';

const SortCell = ({ children, order, setOrder, field }) => {
  const [currentField, desc] = order;
  const active = currentField === field;
  const classes = classnames({
    'bg-gray': active,
    'c-hand': true,
  });
  const onClick = () => {
    setOrder([field, active ? !desc : false]);
  };
  const iconClasses = classnames({
    icon: true,
    'icon-arrow-up': !active || !desc,
    'icon-arrow-down': active && desc,
  });
  return (
    <th className={classes} {...{ onClick }}>
      {children} <i className={iconClasses}></i>
    </th>
  );
};

const textContains = (a, b) => a.toLowerCase().includes(b.toLowerCase());
const textMatches = (a, b) => isSubsequence(a.toLowerCase(), b.toLowerCase());
const textEquals = (a, b) => a.toLowerCase() === b.toLowerCase();

const ROW_CLASSES = {
  2: '',
  1: 'bg-secondary',
  0: 'bg-primary',
};

const filterAndSort = ({ recipes, searchText, order, filters, prices }) => {
  const data = recipes
    .map(recipe => {
      const { name } = recipe;
      return { ...recipe, price: prices[name] };
    })
    .filter(
      recipe =>
        !filters.length ||
        filters.some(({ field, value }) => {
          const recipeValue = recipe[field];
          if (Array.isArray(recipeValue)) {
            return recipeValue.includes(value);
          }
          return recipeValue === value;
        })
    )
    .map(recipe => {
      const { name, ingredients, tool = '' } = recipe;
      let tier = -1;
      if (searchText) {
        if (textContains(name, searchText)) {
          tier = 0;
        } else if (textMatches(name, searchText)) {
          tier = 1;
        } else if (
          textMatches(tool, searchText) ||
          ingredients.some(i => textMatches(i, searchText))
        ) {
          tier = 2;
        }
      } else {
        tier = 2;
      }
      return { ...recipe, tier };
    })
    .filter(({ tier }) => tier > -1);

  const [field, desc] = order;
  let sorted = sortBy(data, [field, 'name']);
  if (desc) {
    sorted.reverse();
  }
  sorted = sortBy(sorted, 'tier');

  return sorted.map(({ tier, ...recipe }) => ({
    ...recipe,
    className: ROW_CLASSES[tier],
  }));
};

const FILTER_CHIP_FIELD_CLASSES = {
  ingredients: 'bg-success',
  tool: 'bg-warning',
};

const FilterChip = ({ children, field, addFilter }) => (
  <span
    onClick={() => {
      if (addFilter) {
        addFilter({ field, value: children });
      }
    }}
    className={classnames('chip', 'c-hand', FILTER_CHIP_FIELD_CLASSES[field])}
  >
    {children}
  </span>
);

const Row = ({
  showTool,
  addFilter,
  row: { className, name, level, ingredients, price, tool },
}) => (
  <tr className={className}>
    <td>{name}</td>
    <td className="text-center">{level}</td>
    <td className="text-break">
      {ingredients.map((ingredient, i) => (
        <FilterChip
          {...{ addFilter }}
          field="ingredients"
          key={`${i}-${ingredient}`}
        >
          {ingredient}
        </FilterChip>
      ))}
    </td>
    <td>{price}</td>
    {showTool && (
      <td>
        <FilterChip {...{ addFilter }} field="tool">
          {tool}
        </FilterChip>
      </td>
    )}
  </tr>
);

export default ({ recipes, prices, showTool }) => {
  const [searchText, setSearchText] = useState('');
  const [order, setOrder] = useState(['level', false]);
  const [filters, setFilters] = useState([]);

  const addFilter = filter => {
    if (!filters.some(f => isEqual(f, filter))) {
      setFilters(filters.concat(filter));
    }
  };

  const addFilterFromSearchText = () => {
    let filter;

    const tools = uniq(recipes.map(({ tool }) => tool).filter(x => x));
    const foundTool = tools.find(
      tool => tool.toLowerCase() === searchText.toLowerCase()
    );
    if (foundTool) {
      filter = { field: 'tool', value: foundTool };
    } else {
      const ingredients = uniq(flatMap(recipes, 'ingredients'));
      for (const method of [textEquals, textContains, textMatches]) {
        const validIngredients = ingredients.filter(i => method(i, searchText));
        if (validIngredients.length === 1) {
          filter = { field: 'ingredients', value: validIngredients[0] };
          break;
        }
      }
    }

    if (filter) {
      addFilter(filter);
      setSearchText('');
    }
  };

  const deleteFilter = index => {
    let newFilters = [...filters];
    pullAt(newFilters, [index]);
    setFilters(newFilters);
  };

  const data = filterAndSort({ recipes, searchText, order, filters, prices });

  return (
    <>
      <div className="form-autocomplete">
        <div className="form-autocomplete-input form-input">
          {filters.map(({ field, value }, i) => (
            <FilterChip key={`${field}-${value}`} {...{ field }}>
              {value}
              <span
                className="btn btn-clear"
                aria-label="Close"
                role="button"
                onClick={() => {
                  deleteFilter(i);
                }}
              />
            </FilterChip>
          ))}

          <input
            className="form-input"
            type="text"
            placeholder="Type to search, enter to filter"
            value={searchText}
            onChange={({ target: { value } }) => {
              setSearchText(value);
            }}
            onKeyUp={({ key }) => {
              if (key === 'Enter') {
                addFilterFromSearchText();
              } else if (key === 'Backspace' && !searchText && filters.length) {
                deleteFilter(filters.length - 1);
              }
            }}
          />
        </div>
      </div>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <SortCell {...{ order, setOrder }} field="name">
              Name
            </SortCell>
            <SortCell {...{ order, setOrder }} field="level">
              Level
            </SortCell>
            <th width="50%">Ingredients</th>
            <SortCell {...{ order, setOrder }} field="price">
              Price
            </SortCell>
            {showTool && (
              <SortCell {...{ order, setOrder }} field="tool">
                Tool
              </SortCell>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <Row
              key={`${row.name}-${row.ingredients.join(',')}`}
              {...{ row, showTool, addFilter }}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};
