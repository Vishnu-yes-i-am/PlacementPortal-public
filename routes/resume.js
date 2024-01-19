const express = require("express");
const router = express.Router();
const middleware = require('../middleware/auth');
const Student = require('../models/Student');
const latex = require('node-latex')
const path = require('path');
const fs = require('fs')
const show = (data, res) => {
    const v = { name: data.first_name + " " + data.last_name, city: "Jaipur", state: "Rajasthan", clg_email: data.clg_email, mobile: data.mobile, website: "", clg: "Malaviya National Institute of technology", clgaddress: "Jaipur,Rajastan", gpclg: data.cgpa, sessionclg: `${data.addmission_year}-${data.addmission_year + 4}`, school12: data.education.s12.school_name, schooladdress12: data.education.s12.address, board12: data.education.s12.board, gp12: data.education.s12.percentage, session12: `${data.education.s12.passing_year - 1}-${data.education.s12.passing_year}`, school10: data.education.s10.school_name, schooladdress10: data.education.s10.address, board10: data.education.s10.board, gp10: data.education.s10.percentage, session10: `${data.education.s10.passing_year - 1}-${data.education.s10.passing_year}`, l_skill: data.skills.languages, t_skill: data.skills.technologies, d_skill: data.skills.database, projects: data.projects, github: data.github, linkedIn: data.linkedIn }

    const header = `\\documentclass[a4paper]{article}
\\usepackage{fullpage}
\\usepackage{amsmath}
\\usepackage{hyperref}
\\usepackage{amssymb}
\\usepackage{textcomp}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\textheight=10in
\\pagestyle{empty}
\\raggedright
\\usepackage[left=0.8in,right=0.8in,bottom=0.8in,top=0.8in]{geometry}

%\\renewcommand{\\encodingdefault}{cg}
%\\renewcommand{\\rmdefault}{lgrcmr}

\\def\\bull{\\vrule height 0.8ex width .7ex depth -.1ex }

% DEFINITIONS FOR RESUME %%%%%%%%%%%%%%%%%%%%%%%

\\newcommand{\\area} [2] {
\\vspace*{-9pt}
\\begin{verse}
    \\textbf{#1}   #2
\\end{verse}
}

\\newcommand{\\lineunder} {
\\vspace*{-8pt} \\\\
\\hspace*{-18pt} \\hrulefill \\\\
}

\\newcommand{\\header} [1] {
{\\hspace*{-18pt}\\vspace*{6pt} \\textsc{#1}}
\\vspace*{-6pt} \\lineunder
}

\\newcommand{\\employer} [3] {
{ \\textbf{#1} (#2)\\\\ \\underline{\\textbf{\\emph{#3}}}\\\\  }
}

\\newcommand{\\contact} [3] {
\\vspace*{-10pt}
\\begin{center}
    {\\Huge \\scshape {#1}}\\\\
    #2 \\\\ #3
\\end{center}
\\vspace*{-8pt}
}

\\newenvironment{achievements}{
\\begin{list}
    {$\\bullet$}{\\topsep 0pt \\itemsep -2pt}}{\\vspace*{4pt}
\\end{list}
}

\\newcommand{\\schoolwithcourses} [4] {
\\textbf{#1} #2 $\\bullet$ #3\\\\
#4 \\\\
\\vspace*{5pt}
}

\\newcommand{\\school} [4] {
\\textbf{#1} #2 $\\bullet$ #3\\\\
#4 \\\\
}
% END RESUME DEFINITIONS %%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}
\\vspace*{-40pt}
\n`
    //profile section 
    const profile = `%==== Profile ====%
\\vspace*{-10pt}
\\begin{center}
        {\\Huge \\scshape {${v.name}}}\\\\\\vspace*{2mm}
        ${v.city + "," + v.state} $\\cdot$ ${v.clg_email} $\\cdot$ ${v.mobile} $\\cdot$ ${v.website}\\\\
\\end{center}\n`;

    //education 

    const education = `%==== Education ====%
\\header{\\Large  Education}\\vspace*{2mm}
\\textbf{${v.clg}}\\hfill ${v.clgaddress}\\\\\\vspace{2mm}
 \\textit{${v.gpclg}} \\hfill ${v.sessionclg}
\\vspace{2mm}\n
\\textbf{${v.school12}}\\hfill ${v.schooladdress12}\\\\\\vspace{2mm}
${v.board12} Intermediate/+2  \\textit{${v.gp12}} \\hfill ${v.session12}\\\\
\\vspace{2mm}
\\textbf{${v.school10}}\\hfill ${v.schooladdress10}\\\\\\vspace{2mm}
${v.board10} Matriculation \\textit{${v.gp10}} \\hfill ${v.session10}\\\\
\\vspace{2mm}\n`
    const skills = `\\header{\\Large Skills}\\vspace*{2mm}
\\vspace{1mm}
\\begin{tabular}{ l l }
	Languages:             & ${v.l_skill.join(', ')}                     \\\\
	Technologies:          & ${v.t_skill.join(', ')} \\\\
	Platforms \\par: & ${v.d_skill.join(', ')}                 \\\\
\\end{tabular}
\\vspace*{2mm}\n`

    var projects = `\n\\header{\\Large  Projects}\\vspace*{2mm}\n`
    const project = (p) => {
        return `\n{\\textbf{\\large ${p.title}}} \\vspace*{2mm}\\hfill\\href{${p.link}}{${p.link}}.\\\\
{\\sl ${p.techUsed}} \\\\\\vspace{2mm}
${p.desc}\\\\ \\vspace*{2mm}`;
    }
    for (var i = 0; i < v.projects.length; i++) {
        projects += project(v.projects[i]);
    }
    const socials = `\n\\header{\\Large  Socials}\\vspace*{2mm}\n
\n{\\textbf{\\large Github}} \\vspace*{2mm}\\hfill\\href{${v.github}}{visit profile}.\\\\
\n{\\textbf{\\large LinkedIn}} \\vspace*{2mm}\\hfill\\href{${v.linkedIn}}{visit profile}.\\\\`

    const awards = `\n\\header{\\Large Honour/Awards }\\vspace*{2mm}\n
\n{\\textbf{\\large District level hockey player}} \\vspace*{2mm}\\hfill\\href{}{Government of Rajasthan}.\\\\
Recognized for being a district level hockey player for three consesutive years.\\vspace*{2mm}\n`
    const extra_activity = `\n\\header{\\Large  Extra Curricular Activities}\\vspace*{2mm}\n
\n{\\textbf{\\large Technical Society}} \\vspace*{2mm}\\hfill\\href{}{MNIT Jaipur}.\\\\
Attended various events and competitions.\\vspace*{2mm}
\n{\\textbf{\\large VolleyBall Player}} \\vspace*{2mm}\\hfill\\href{}{MNIT Jaipur}.\\\\
An active Volleyball player in the college volleyball team.\\vspace*{2mm}
\n{\\textbf{\\large Sports Club}} \\vspace*{2mm}\\hfill\\href{}{MNIT Jaipur}.\\\\
Participated in different competitions and showed my skills at scale\\vspace*{2mm}\n`

    const interests = `\n\\header{\\Large Interests/Hobbies }\\vspace*{2mm}\n
\n{\\textbf{\\large WorkOut and Gym}} \\vspace*{2mm}\\\\\n
\n{\\textbf{\\large Reading}} \\vspace*{2mm}\\\\\n
\n{\\textbf{\\large Volleyball}} \\vspace*{2mm}\\\\\n`
    const footer = `\\ 
\\end{document}`

    const outputfile = `${path.join(__dirname.replace("routes", path.join("public", "resume")), (data.first_name + "_" + data.last_name + ".tex"))}`;
    fs.open(outputfile, 'w', function (err, fd) {
        if (err) {
            return console.error(err);
        }
    });
    fs.writeFile(outputfile, header + profile + education + skills + projects + socials + extra_activity + interests + footer, function (err) {
        if (err) {
            return console.error(err);
        }
        try {
            const input = fs.createReadStream(outputfile)
            const pdf = latex(input)
            pdf.pipe(res)

            pdf.on('error', err => console.error(err))
            pdf.on('finish', async () => {
                // Delete Resume After Sending
                fs.unlink(outputfile, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            })
        }
        catch (err) {
            console.log(err);
            res.send("Unable to generate resume at the movement")
        }
    });
}
//coordinator access for resume

router.get("/view", middleware.login_coord, async (req, res) => {
    try {
        if (req.verdict) {
            let id = req.query.id;
            const data = (await Student.find({ _id: id }))[0];
            show(data, res);
        }
        else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(err);
    }

})
//recruiter access for resume of students

router.get("/viewCandidate", middleware.login_recr, async (req, res) => {
    try {
        if (req.verdict) {
            let id = req.query.id;
            const data = (await Student.find({ _id: id }))[0];
            show(data, res);
        }
        else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(err);
    }

})


router.get("/view_myResume", middleware.login_stud, async (req, res) => {
    try {
        if (req.verdict) {
            show(req.data, res);
        }
        else {
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
    }

})



module.exports = router;