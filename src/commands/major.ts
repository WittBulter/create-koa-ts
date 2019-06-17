import fs from 'fs'
import path from 'path'
import { CommandMajor } from 'func'
import { execSync } from 'child_process'
import * as print from '../utils/print'
import * as spinner from '../utils/spinner'

@CommandMajor()
export class Major {
  private projectName: string
  private projectPath: string
  
  constructor() {
    print.welcome()
    this.input()
      .then(() => this.install())
      .then(() => this.after())
      .catch(print.catchErr)
  }
  
  async input(): Promise<void> {
    const getProject = (reuqired: boolean = false) => {
      const prompt = require('prompt-sync')()
      const str = print.promptText(`> You need to specify the project name${reuqired ? '(required)' : ''}: `)
      let project = prompt(str)
      if (project === null) throw new Error('About. Nothing has changed.')
      if (!project) project = getProject(true)
      return project
    }
    const project = getProject()
    this.projectPath = path.join(process.cwd(), project)
    if (fs.existsSync(this.projectPath)) throw new Error(`Abort, "${project}" already exists. Nothing has changed.`)
    this.projectName = project
  }
  
  async install(): Promise<void> {
    spinner.start('template installing...')
    return new Promise((resolve, reject) => {
      require('git-clone')(
        'https://github.com/WittBulter/koa-ts',
        this.projectPath,
        { shallow: true },
        (err) => {
          if (err) return reject(new Error(`About. ${err}`))
          spinner.succeed(true)
          spinner.start('Installed, enjoy!')
          spinner.succeed()
          console.log('')
          resolve()
        },
      )
    })
  }
  
  async after(): Promise<void> {
    execSync(`cd ${this.projectPath} && rm -rf cli .git .circle.yml .travis.yml .github now.json README_CN.md`)
    const pkgPath = path.join(this.projectPath, 'package.json')
    if (!fs.existsSync(pkgPath)) return
    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg = Object.assign(pkg, {
      name: this.projectName,
      version: '0.0.1',
    })
    delete pkg.author
    delete pkg.bugs
    delete pkg.description
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }
  
}
