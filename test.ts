interface Cat {
  name: string,
}

interface Car {
  model: string,
  brand: string,
}


type Test =
  {
    type: 'car',
    value: Car,
  } |
  {
    type: 'cat',
    value: Cat,
  };

function as_car(): Car | undefined {
  console.log(this);
  return (this.type === 'car' && this.value) || undefined;
}

const value = {
  type: 'car',
  value: {
    model: 'polo',
    brand: 'vw',
  },

  as_car,
};

const car = value.as_car();
