import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    files: ["**/*.rules"],
    plugins: {
      'firebase-rules': firebaseRulesPlugin
    },
    rules: {
      "firebase-rules/no-open-reads": "warn",
      "firebase-rules/no-open-writes": "error",
      "firebase-rules/no-redundant-matches": "error"
    }
  }
];
