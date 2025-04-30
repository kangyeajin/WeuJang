const sql = require("mssql");
const dbConfig = require("../dbconfig.js");

// 로그인 처리 함수
async function handleLogin(req, res, id, pw) {

    if (id === 'admin' && pw === '1234') {
        res.redirect('/main');
      } else {
        res.send('로그인 실패. 아이디 또는 비밀번호가 잘못되었습니다.');
      }


/*     if (!frID || frID.length < 3 || frID.length > 20) {
        return res.status(400).json({ message: "ID는 3글자 이상 20글자 이하이어야 합니다." });
    }
    if (!frPWD || frPWD.length < 2 || frPWD.length > 20) {
        return res.status(400).json({ message: "Password는 2글자 이상 20글자 이하이어야 합니다." });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        request.input("a_id", sql.VarChar(20), frID);
        request.input("a_pass", sql.VarChar(20), frPWD);
        request.input("con_ip", sql.VarChar(15), req.ip);

        const result = await request.execute("SP_LOGIN");        
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            req.session.user = {
                seq: user.Seq,
                id: user.Staff_Id,
                name: user.Staff_Name,
                division: user.Staff_Division,
                part: user.Staff_Part,
                email: user.Staff_Email,
                key: user.Staff_key,
            };
            // console.log(req.session.user);
            return res.status(200).json({ message: "Login successful", redirect: "/dashboard" });
        } else {
            return res.status(401).json({ message: "Invalid ID or Password. Please try again." });
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed. Please try again later." });
    } finally {
        sql.close();
    } */
}

module.exports = { handleLogin };