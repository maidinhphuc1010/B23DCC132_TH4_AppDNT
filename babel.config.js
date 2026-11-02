module.exports = api => ({
  presets: [api.env('test') ? 'module:@react-native/babel-preset' : 'babel-preset-expo'],
});
