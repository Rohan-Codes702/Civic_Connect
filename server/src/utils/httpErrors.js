export const isDuplicateKeyError = (error) =>
	error?.code === 11000 || error?.code === 11001;

export const validationMessage = (error) => {
	if (error?.name !== "ValidationError" || !error.errors) return null;
	const first = Object.values(error.errors)[0];
	return first?.message || "Invalid input";
};

export const logSafeError = (context, error) => {
	console.error(context, {
		name: error?.name,
		code: error?.code,
		message: error?.message
	});
};
