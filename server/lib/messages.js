module.exports = {
	APP_SHELL_WARNING: `
/*********** n-express warning ************/

You have set the environment variable NEXT_APP_SHELL=local
This should only be used if you are actively developing
n-ui/n-html-app within the context of an app (by bower linking
or similar). It will slow down your build A LOT and be a slightly
less accurate approximation of the production app!!!!

If you do not need this behaviour run

			unset NEXT_APP_SHELL

/*********** n-express warning ************/
`
};
