module.exports = (req, res, next) => {
	res.locals.currentYear = new Date().getFullYear();
	next();
};
