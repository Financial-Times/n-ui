# What is this weird `n-ui/components/n-ui` structure?

It’s an easy but ugly hack to avoid issues with n-ui’s [internal partials referencing n-ui](https://github.com/Financial-Times/n-ui/blob/v5.0.0-beta.5/components/n-ui/header/template.html#L10).
To get rid it, we need to rename all n-ui’s internal partials to not include `n-ui/`. Please do 😬
